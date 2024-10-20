import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

#define Matplotlib figure and axis
fig, ax = plt.subplots()

#create simple line plot
ax.plot([0, 10],[0, 10])

#add rectangle to plot
ax.add_patch(Rectangle((1, 1), 0.4, 0.1))
ax.add_patch(Rectangle((2, 2), 0.4, 0.1))
ax.add_patch(Rectangle((3, 3), 0.4, 0.1))

#display plot
plt.show()


y = range(1, 11)
xmin = range(10)
xmax = range(1, 11)
colors=['blue', 'green', 'red', 'yellow', 'orange', 'purple', 
        'cyan', 'magenta', 'pink', 'black']

fig, ax2 = plt.subplots(1, 1)
ax2.hlines(y, xmin, xmax, colors=colors)
plt.show()