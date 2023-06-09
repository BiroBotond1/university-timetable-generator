import matplotlib.pyplot as plt
import numpy as np

f = open("../Webserver/Plot_data.txt", "r")
plot_data = f.read().split()
i = 0
fitnessClass = []
fitnessTeacher = []
fitnessLocation = []
temp = []
for data in plot_data:
    if i % 4 == 0:
        fitnessClass.append(data)
    if i % 4 == 1:
        fitnessTeacher.append(data)
    if i % 4 == 2:
        fitnessLocation.append(data)
    if i % 4 == 3:
        temp.append(data)
    i +=1

fig, ax = plt.subplots(1,3)

fig.tight_layout()
ax[0].plot(temp, np.asarray(fitnessClass, float))
ax[0].set_title('Class')
ax[0].set_xticks([])
ax[0].set_xlabel('Temperature')
ax[0].set_ylabel('Class Fitness')
ax[1].plot(temp, np.asarray(fitnessTeacher, float))
ax[1].set_title('Teacher')
ax[1].set_xticks([])
ax[1].set_xlabel('Temperature')
ax[1].set_ylabel('Teacher Fitness')
ax[2].plot(temp, np.asarray(fitnessLocation, float))
ax[2].set_title('Location')
ax[2].set_xticks([])
ax[2].set_xlabel('Temperature')
ax[2].set_ylabel('Location Fitness')
plt.show()