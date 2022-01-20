from os import path
import numpy as np
import re

def load_data():
    commands = []
    cuboids = []
    with open(path.join(path.dirname(__file__), "input.txt")) as f:
        for line in f:
            # on x=-36..10,y=-44..1,z=-18..28
            result = re.match(r"(on|off) x=(-?\d+)..(-?\d+),y=(-?\d+)..(-?\d+),z=(-?\d+)..(-?\d+)", line)
            if result is not None:
                type, x1, x2, y1, y2, z1, z2 = result.groups()
                x1, x2, y1, y2, z1, z2 = int(x1), int(x2), int(y1), int(y2), int(z1), int(z2)
                if x1 > x2:
                    x1, x2 = x2, x1
                if y1 > y2:
                    y1, y2 = y2, y1
                if z1 > z2:
                    z1, z2 = z2, z1
                commands.append(type)
                cuboids.append([x1, x2, y1, y2, z1, z2])
    return commands, cuboids


def calc(commands, cuboids, minX = -50, maxX = 50, minY = -50, maxY = 50, minZ = -50, maxZ = 50):
    reactor_core = np.zeros((maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1), dtype=bool)

    for idx, command in enumerate(commands):
        x1, x2, y1, y2, z1, z2 = cuboids[idx]
        if x2 < minX or x1 > maxX or y2 < minY or y1 > maxY or z2 < minZ or z1 > maxZ:
            continue
        if x1 < minX:
            x1 = minX
        if x2 > maxX:
            x2 = maxX
        if y1 < minY:
            y1 = minY
        if y2 > maxY:
            y2 = maxY
        if z1 < minZ:
            z1 = minZ
        if z2 > maxZ:
            z2 = maxZ

        x1 -= minX
        x2 -= minX
        y1 -= minY
        y2 -= minY
        z1 -= minZ
        z2 -= minZ

        if command == "on":
            reactor_core[x1:x2 + 1, y1:y2 + 1, z1:z2 + 1] = True
        elif command == "off":
            reactor_core[x1:x2 + 1, y1:y2 + 1, z1:z2 + 1] = False

    return np.sum(reactor_core == True)


def Q1():
    commands, cuboids = load_data()
    cuboids = np.array(cuboids)
    print(f"Q1: {calc(commands, cuboids)}")


def Q2():
    commands, cuboids = load_data()

    unintersect_cuboids = []
    for idx, cuboid in enumerate(cuboids):
        x1, x2, y1, y2, z1, z2 = cuboid
        unintersect_cuboids_copy = unintersect_cuboids.copy()
        unintersect_cuboids = []
        for exist_cuboid in unintersect_cuboids_copy:
            ox1, ox2, oy1, oy2, oz1, oz2 = exist_cuboid
            if ox1 > ox2 or oy1 > oy2 or oz1 > oz2:
                # invalid cuboid
                continue
            if x2 < ox1 or x1 > ox2 or y2 < oy1 or y1 > oy2 or z2 < oz1 or z1 > oz2:
                # no intersection
                unintersect_cuboids.append(exist_cuboid)
            elif x1 <= ox1 and x2 >= ox2 and y1 <= oy1 and y2 >= oy2 and z1 <= oz1 and z2 >= oz2:
                # exist_cuboid is inside cuboid
                continue
            else:
                nx1 = max(x1, ox1)
                nx2 = min(x2, ox2)
                ny1 = max(y1, oy1)
                ny2 = min(y2, oy2)
                nz1 = max(z1, oz1)
                nz2 = min(z2, oz2)

                # intersection 分成27块-1
                unintersect_cuboids.append([    ox1, nx1 - 1,     oy1, ny1 - 1,     oz1, nz1 - 1])
                unintersect_cuboids.append([    nx1,     nx2,     oy1, ny1 - 1,     oz1, nz1 - 1])
                unintersect_cuboids.append([nx2 + 1,     ox2,     oy1, ny1 - 1,     oz1, nz1 - 1])
                unintersect_cuboids.append([    ox1, nx1 - 1,     ny1,     ny2,     oz1, nz1 - 1])
                unintersect_cuboids.append([    nx1,     nx2,     ny1,     ny2,     oz1, nz1 - 1])
                unintersect_cuboids.append([nx2 + 1,     ox2,     ny1,     ny2,     oz1, nz1 - 1])
                unintersect_cuboids.append([    ox1, nx1 - 1, ny2 + 1,     oy2,     oz1, nz1 - 1])
                unintersect_cuboids.append([    nx1,     nx2, ny2 + 1,     oy2,     oz1, nz1 - 1])
                unintersect_cuboids.append([nx2 + 1,     ox2, ny2 + 1,     oy2,     oz1, nz1 - 1])

                unintersect_cuboids.append([    ox1, nx1 - 1,     oy1, ny1 - 1,     nz1,     nz2])
                unintersect_cuboids.append([    nx1,     nx2,     oy1, ny1 - 1,     nz1,     nz2])
                unintersect_cuboids.append([nx2 + 1,     ox2,     oy1, ny1 - 1,     nz1,     nz2])
                unintersect_cuboids.append([    ox1, nx1 - 1,     ny1,     ny2,     nz1,     nz2])
                # unintersect_cuboids.append([    nx1,     nx2,     ny1,     ny2,     nz1,     nz2])
                unintersect_cuboids.append([nx2 + 1,     ox2,     ny1,     ny2,     nz1,     nz2])
                unintersect_cuboids.append([    ox1, nx1 - 1, ny2 + 1,     oy2,     nz1,     nz2])
                unintersect_cuboids.append([    nx1,     nx2, ny2 + 1,     oy2,     nz1,     nz2])
                unintersect_cuboids.append([nx2 + 1,     ox2, ny2 + 1,     oy2,     nz1,     nz2])

                unintersect_cuboids.append([    ox1, nx1 - 1,     oy1, ny1 - 1, nz2 + 1,     oz2])
                unintersect_cuboids.append([    nx1,     nx2,     oy1, ny1 - 1, nz2 + 1,     oz2])
                unintersect_cuboids.append([nx2 + 1,     ox2,     oy1, ny1 - 1, nz2 + 1,     oz2])
                unintersect_cuboids.append([    ox1, nx1 - 1,     ny1,     ny2, nz2 + 1,     oz2])
                unintersect_cuboids.append([    nx1,     nx2,     ny1,     ny2, nz2 + 1,     oz2])
                unintersect_cuboids.append([nx2 + 1,     ox2,     ny1,     ny2, nz2 + 1,     oz2])
                unintersect_cuboids.append([    ox1, nx1 - 1, ny2 + 1,     oy2, nz2 + 1,     oz2])
                unintersect_cuboids.append([    nx1,     nx2, ny2 + 1,     oy2, nz2 + 1,     oz2])
                unintersect_cuboids.append([nx2 + 1,     ox2, ny2 + 1,     oy2, nz2 + 1,     oz2])

        if commands[idx] == "on":
            unintersect_cuboids.append(cuboid)

    count = 0
    for cuboid in unintersect_cuboids:
        x1, x2, y1, y2, z1, z2 = cuboid
        if x1 > x2 or y1 > y2 or z1 > z2:
            continue # invalid cuboid (其实不判断也无所谓, 因为正好只大1, 下面算出来也是0)
        count += (x2 - x1 + 1) * (y2 - y1 + 1) * (z2 - z1 + 1)

    print(f"Q2: {count}")


if __name__ == "__main__":
    Q1()
    Q2()
