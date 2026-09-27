import { after, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'

import { connectTestDb, disconnectTestDb, resetTestDb } from './helpers/db.js'
import { makeProject, makeUser } from './helpers/fixtures.js'
import * as projectService from '../src/services/ProjectService.js'
import { model as Project } from '../src/models/Project.js'
import { model as ProjectMember } from '../src/models/ProjectMember.js'
import { model as User } from '../src/models/User.js'

before(() => connectTestDb('projects'))
beforeEach(() => resetTestDb())
after(() => disconnectTestDb())

describe('project membership', () => {
  test('a user sees the projects they own and not anyone else\'s', async () => {
    const alice = await makeUser()
    const bob = await makeUser()

    await makeProject(alice, 'School A')
    await makeProject(alice, 'School B')

    assert.equal((await projectService.listForUser(alice._id)).length, 2)
    assert.equal((await projectService.listForUser(bob._id)).length, 0)
  })

  test('the creator becomes the owner, with an owner membership row', async () => {
    const alice = await makeUser()
    const project = await makeProject(alice)

    assert.equal(String(project.owner), String(alice._id))

    const membership = await projectService.getMembership(project._id, alice._id)
    assert.equal(membership.role, 'owner')
    assert.equal(membership.status, 'active')
  })

  test('a non-member has no membership', async () => {
    const alice = await makeUser()
    const bob = await makeUser()
    const project = await makeProject(alice)

    assert.equal(await projectService.getMembership(project._id, bob._id), null)
  })
})

describe('invitations', () => {
  test('an invited user is not a member until they accept', async () => {
    const alice = await makeUser()
    const bob = await makeUser('bob@school.hu')
    const project = await makeProject(alice)

    await projectService.invite(project._id, 'bob@school.hu', alice._id)

    assert.equal((await projectService.listForUser(bob._id)).length, 0)
    assert.equal((await projectService.listInvitationsForUser(bob._id)).length, 1)

    await projectService.respondToInvitation(project._id, bob._id, true)

    assert.equal((await projectService.listForUser(bob._id)).length, 1)
    assert.equal(
      (await projectService.getMembership(project._id, bob._id)).role,
      'collaborator'
    )
  })

  test('declining keeps the user out', async () => {
    const alice = await makeUser()
    const bob = await makeUser('bob@school.hu')
    const project = await makeProject(alice)

    await projectService.invite(project._id, 'bob@school.hu', alice._id)
    await projectService.respondToInvitation(project._id, bob._id, false)

    assert.equal((await projectService.listForUser(bob._id)).length, 0)
  })

  test('the email address is matched case-insensitively', async () => {
    const alice = await makeUser()
    const bob = await makeUser('bob@school.hu')
    const project = await makeProject(alice)

    await projectService.invite(project._id, '  BOB@School.HU  ', alice._id)

    assert.equal((await projectService.listInvitationsForUser(bob._id)).length, 1)
  })

  test('an invitation to someone with no account binds when they sign in', async () => {
    const alice = await makeUser()
    const project = await makeProject(alice)

    await projectService.invite(project._id, 'carol@school.hu', alice._id)

    // unbound until that address exists
    assert.equal(
      await ProjectMember.countDocuments({ email: 'carol@school.hu', user: null }),
      1
    )

    const carol = await User.create({ auth0Id: 'auth0|carol', email: 'carol@school.hu' })
    const bound = await projectService.bindPendingInvitations(carol._id, 'Carol@School.hu')

    assert.equal(bound, 1)
    assert.equal((await projectService.listInvitationsForUser(carol._id)).length, 1)
  })

  test('binding without a verified email does nothing', async () => {
    const alice = await makeUser()
    const carol = await makeUser('carol@school.hu')
    const project = await makeProject(alice)

    await projectService.invite(project._id, 'carol@school.hu', alice._id)

    assert.equal(await projectService.bindPendingInvitations(carol._id, null), 0)
    assert.equal(await projectService.bindPendingInvitations(carol._id, ''), 0)
  })

  test('re-inviting an active member is refused', async () => {
    const alice = await makeUser()
    const bob = await makeUser('bob@school.hu')
    const project = await makeProject(alice)

    await projectService.invite(project._id, 'bob@school.hu', alice._id)
    await projectService.respondToInvitation(project._id, bob._id, true)

    await assert.rejects(
      () => projectService.invite(project._id, 'bob@school.hu', alice._id),
      /already a member/
    )
  })

  test('an invitation needs an email address', async () => {
    const alice = await makeUser()
    const project = await makeProject(alice)

    await assert.rejects(
      () => projectService.invite(project._id, '   ', alice._id),
      /email address is required/
    )
  })
})

describe('ownership', () => {
  test('the owner cannot be removed', async () => {
    const alice = await makeUser()
    const project = await makeProject(alice)

    await assert.rejects(
      () => projectService.removeMember(project._id, alice._id),
      /transfer ownership first/
    )
  })

  test('transferring ownership demotes the previous owner', async () => {
    const alice = await makeUser()
    const bob = await makeUser('bob@school.hu')
    const project = await makeProject(alice)

    await projectService.invite(project._id, 'bob@school.hu', alice._id)
    await projectService.respondToInvitation(project._id, bob._id, true)
    await projectService.transferOwnership(project._id, bob._id)

    assert.equal(String((await Project.findById(project._id)).owner), String(bob._id))
    assert.equal((await projectService.getMembership(project._id, bob._id)).role, 'owner')
    assert.equal(
      (await projectService.getMembership(project._id, alice._id)).role,
      'collaborator'
    )
  })

  test('ownership cannot be handed to a non-member', async () => {
    const alice = await makeUser()
    const stranger = await makeUser()
    const project = await makeProject(alice)

    await assert.rejects(
      () => projectService.transferOwnership(project._id, stranger._id),
      /must already be a member/
    )
  })

  test('a removed member loses access', async () => {
    const alice = await makeUser()
    const bob = await makeUser('bob@school.hu')
    const project = await makeProject(alice)

    await projectService.invite(project._id, 'bob@school.hu', alice._id)
    await projectService.respondToInvitation(project._id, bob._id, true)
    await projectService.removeMember(project._id, bob._id)

    assert.equal(await projectService.getMembership(project._id, bob._id), null)
  })
})

describe('deletion', () => {
  test('deleting a project removes it and its memberships', async () => {
    const alice = await makeUser()
    const project = await makeProject(alice)

    await projectService.remove(project._id)

    assert.equal(await Project.findById(project._id), null)
    assert.equal(await ProjectMember.countDocuments({ project: project._id }), 0)
  })

  test('deleting a project that does not exist returns null', async () => {
    const alice = await makeUser()
    const project = await makeProject(alice)

    await projectService.remove(project._id)

    assert.equal(await projectService.remove(project._id), null)
  })
})
