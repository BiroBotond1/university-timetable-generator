/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

 #include <grpcpp/ext/proto_server_reflection_plugin.h>
 #include <grpcpp/grpcpp.h>
 #include <grpcpp/health_check_service_interface.h>
 
 #include <iostream>
 #include <memory>
 #include <string>
 
 #include "absl/flags/flag.h"
 #include "absl/flags/parse.h"
 #include "absl/strings/str_format.h"

 #ifdef BAZEL_BUILD
 #include "examples/protos/generator.grpc.pb.h"
 #else
 #include "generator.grpc.pb.h"
 #endif
 
#include <vector>
#include <string>
#include <iostream>
#include <nlohmann/json.hpp>
#include <sstream>
#include <optional>
#include <fstream>
#include <algorithm>
#include <random>
#include <chrono>
#include <thread>
#include <future>
#include "MyTime.h"
#include "TimetableGenerator.h"

 using grpc::Server;
 using grpc::ServerBuilder;
 using grpc::ServerContext;
 using grpc::Status;
 using generator::Generator;
 using generator::GenerateReply;
 using generator::GenerateRequest;
 
 ABSL_FLAG(uint16_t, port, 50051, "Server port for the service");
 
 // Logic and data behind the server's behavior.
 class GeneratorServiceImpl final : public Generator::Service {
   Status Generate(ServerContext* context, const GenerateRequest* request,
       GenerateReply* reply) override {

     TimetableGenerator generator;
     std::string input = request->input();

     auto future = std::async(std::launch::async, [&generator, input]() {
         return generator.Run(input);
     });

     while (true) {
         // Wait for a small time slice
         auto status = future.wait_for(std::chrono::milliseconds(100));

         if (status == std::future_status::ready) {
             // Finished normally
             auto output = future.get();
             reply->set_output(output);
             return Status::OK;
         }

         if (context->IsCancelled()) {
             // Client cancelled the request
             std::cout << "Client cancelled request" << std::endl;
             return Status(grpc::StatusCode::CANCELLED, "Request cancelled");
         }
     }
   }
 };
 
 void RunServer(uint16_t port) {
   std::string server_address = absl::StrFormat("0.0.0.0:%d", port);
   GeneratorServiceImpl service;
 
   grpc::EnableDefaultHealthCheckService(true);
   grpc::reflection::InitProtoReflectionServerBuilderPlugin();
   ServerBuilder builder;
   // Listen on the given address without any authentication mechanism.
   builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
   // Register "service" as the instance through which we'll communicate with
   // clients. In this case it corresponds to an *synchronous* service.
   builder.RegisterService(&service);
   // Finally assemble the server.
   std::unique_ptr<Server> server(builder.BuildAndStart());
   std::cout << "Server listening on " << server_address << std::endl;
 
   // Wait for the server to shutdown. Note that some other thread must be
   // responsible for shutting down the server for this call to ever return.
   server->Wait();
 }
 
 int main(int argc, char** argv) {
   absl::ParseCommandLine(argc, argv);
   RunServer(absl::GetFlag(FLAGS_port));
   return 0;
 }
 