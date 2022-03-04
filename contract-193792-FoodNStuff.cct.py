"""Spiral List (Forgot actual name)"""
l = [
    [16,31,37,22,49, 4, 8,20],
    [19,19,17,17, 3,33,20,20],
    [49, 7, 5,34,44,39, 2, 7],
    [ 1, 4,20,49,33,45, 1,36],
    [24, 2,21,46,49,49,31,27],
    [ 5, 4,48,33,30,16, 2,27],
    [32,15,26,37,20, 5, 3,25],
    [23,18,23,20,46,43,27,42],
    [24,40,18,46,27, 7,26,33],
    [50,30,17,47,28,34,18, 6],
    [18,39,14, 3,32,25,31,21],
    [13, 8,34, 7,39, 3,40,40],
    [30,48, 9,23,39,33,18,24],
    [46,10,43, 9,21, 1, 4,36],
    [25,34,33,46,12,19,17,10]
]

top = 0
bottom = len(l)-1
left = 0
right = len(l[0])-1
direction = 'right'
x = 0
y = 0
ordered = []

for i in range(len(l)*len(l[0])):
    print('x:', x, 'y:', y)
    print('element:', l[y][x], 'going:', direction)
    ordered.append(l[y][x])
    if direction == 'right':
        if x+1 > right:
            direction = 'down'
            top += 1
            y += 1
        else:
            x += 1
    elif direction == 'left':
        if x-1 < left:
            direction = 'up'
            bottom -= 1
            y -= 1
        else:
            x -= 1
    elif direction == 'down':
        if y+1 > bottom:
            direction = 'left'
            right -= 1
            x -= 1
        else:
            y += 1
    elif direction == 'up':
        if y-1 < top:
            direction = 'right'
            left += 1
            x += 1
        else:
            y -= 1

print(ordered)
