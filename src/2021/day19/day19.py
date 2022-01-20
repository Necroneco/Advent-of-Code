from os import path
import re
import numpy as np

Distances = list[float]
Beacon = list[int]  # x, y, z
Scanner = list[Beacon]
BeaconsDistances = list[Distances]

rotate_x = np.array([
    [1, 0, 0, 0],
    [0, 0, -1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 1]
])
rotate_y = np.array([
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [-1, 0, 0, 0],
    [0, 0, 0, 1]
])
rotate_z = np.array([
    [0, -1, 0, 0],
    [1, 0, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])

def each_rotation(v, rot):
    yield v
    v = v.dot(rot)
    yield v
    v = v.dot(rot)
    yield v
    v = v.dot(rot)
    yield v

def each_direction(v):
    yield from each_rotation(v, rotate_x)
    v = v.dot(rotate_y)
    yield from each_rotation(v, rotate_z)
    v = v.dot(rotate_y)
    yield from each_rotation(v, rotate_x)
    v = v.dot(rotate_y)
    yield from each_rotation(v, rotate_z)
    v = v.dot(rotate_x)
    yield from each_rotation(v, rotate_y)
    v = v.dot(rotate_x)
    v = v.dot(rotate_x)
    yield from each_rotation(v, rotate_y)

all_directions = list(each_direction(np.identity(4, dtype=int)))


def load_data():
    with open(path.join(path.dirname(__file__), "input.txt")) as f:
        scanners: list[Scanner] = []

        currentScannerId = -1
        for line in f:
            result = re.match(r"--- scanner (\d+) ---", line)
            if result is not None:
                currentScannerId = int(result.groups()[0])
                scanners.append([])
            elif line != "\n":
                (x, y, z) = line.strip().split(',')
                scanners[currentScannerId].append(np.array([int(x), int(y), int(z), 1], dtype=int))

    for i in range(len(scanners)):
        scanners[i] = np.array(scanners[i])

    distances = [[[np.linalg.norm(beacon - b) for b in scanner] for beacon in scanner] for scanner in scanners]

    return scanners, distances


def get_connect_matrix(d1: BeaconsDistances, d2: BeaconsDistances, s1: Scanner, s2: Scanner):
    '''
    返回 s2 到 s1 的连接矩阵
    s2.dot(mat) == s1
    '''
    for i1, ds1 in enumerate(d1):
        for i2, ds2 in enumerate(d2):
            if len(np.intersect1d(ds1, ds2)) >= 12:
                b1: Beacon = s1[i1]
                nrows, ncols = s1.shape
                dtype = {
                    'names': ['f{}'.format(i) for i in range(ncols)],
                    'formats': ncols * [s1.dtype]
                }
                for mat in all_directions:
                    ss2 = s2.dot(mat)
                    diff = b1 - ss2[i2]
                    ss2 += diff
                    intersected = np.intersect1d(s1.view(dtype), ss2.view(dtype))
                    if len(intersected) >= 12:
                        mat = np.copy(mat)
                        mat[3][0] = diff[0]
                        mat[3][1] = diff[1]
                        mat[3][2] = diff[2]
                        return mat
    return None


def resolve_xf(scanners, distances):
    '''
    返回sn到s0的连接矩阵
    '''
    xf = dict()
    xf[0] = np.identity(4, dtype=int)
    pending = []

    def resolve_pair(i, j):
        if i == j: return
        if i in xf and j in xf:
            return
        if i in xf:
            mat = get_connect_matrix(distances[i], distances[j], scanners[i], scanners[j])
            if mat is not None:
                # print(f"{j}-{i}: {mat}")
                xf[j] = mat.dot(xf[i])
                print(f"{j}: {xf[j]}")
        elif j in xf:
            mat = get_connect_matrix(distances[j], distances[i], scanners[j], scanners[i])
            if mat is not None:
                # print(f"{i}-{j}: {mat}")
                xf[i] = mat.dot(xf[j])
                print(f"{i}: {xf[i]}")
        else:
            pending.append((i, j))

    count = len(distances)
    for i in range(count):
        for j in range(count):
            resolve_pair(i, j)

    while len(pending) > 0:
        pending_copy = pending.copy()
        pending = []
        for i, j in pending_copy:
            resolve_pair(i, j)

    return xf


def manhhattan(p1, p2):
    return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1]) + abs(p1[2] - p2[2])


def main():
    scanners, distances = load_data()

    xf = resolve_xf(scanners, distances)
    # print(xf)

    all_beacons = []
    for idx, scanner in enumerate(scanners):
        for beacon in scanner:
            p = list(beacon.dot(xf[idx]))
            if p not in all_beacons:
                all_beacons.append(p)
    print(f"Q1: {len(all_beacons)}")

    positions = []
    total = len(scanners)
    for i in range(total):
        position = (-np.array([0,0,0,1], dtype=int).dot(xf[i]))[:3]
        print(f"{i}: {position}")
        positions.append(position)

    max = 0
    for i in range(total):
        for j in range(i + 1, total):
            dis = manhhattan(positions[i], positions[j])
            if dis > max:
                max = dis
    print(f"Q2: {max}")


if __name__ == "__main__":
    main()
