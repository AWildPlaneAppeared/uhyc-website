import sys, fitz, json

PDF = sys.argv[1]
OUT = sys.argv[2]
doc = fitz.open(PDF)
page = doc[0]
Wp = page.rect.width
Z = 820.0 / Wp
pix = page.get_pixmap(matrix=fitz.Matrix(Z, Z), alpha=False)
w, h, n = pix.width, pix.height, pix.n
s = pix.samples
print("img", w, h, n)

def px(x, y):
    i = (y * w + x) * n
    return s[i], s[i + 1], s[i + 2]

# Main-map crop (exclude header bar, bottom legend, locator inset)
x0, x1 = int(0.06 * w), int(0.94 * w)
y0, y1 = int(0.05 * h), int(0.80 * h)

def is_hl(r, g, b):
    # peach board highlight: warm, R highest, B notably lower than R
    return r > 198 and (r - b) >= 34 and (r - g) >= 16 and g > 165 and b < 215

mask = bytearray(w * h)
cnt = 0
for y in range(y0, y1):
    base = y * w
    for x in range(x0, x1):
        r, g, b = px(x, y)
        if is_hl(r, g, b):
            mask[base + x] = 1
            cnt += 1
print("hl pixels", cnt)

# ---- morphological closing (bridge roads/gaps) ----
def dilate(src, r):
    horiz = bytearray(w * h)
    for y in range(y0, y1):
        b = y * w
        for x in range(x0, x1):
            on = 0
            for dx in range(-r, r + 1):
                nx = x + dx
                if x0 <= nx < x1 and src[b + nx]:
                    on = 1; break
            horiz[b + x] = on
    out = bytearray(w * h)
    for x in range(x0, x1):
        for y in range(y0, y1):
            on = 0
            for dy in range(-r, r + 1):
                ny = y + dy
                if y0 <= ny < y1 and horiz[ny * w + x]:
                    on = 1; break
            out[y * w + x] = on
    return out

def erode(src, r):
    horiz = bytearray(w * h)
    for y in range(y0, y1):
        b = y * w
        for x in range(x0, x1):
            on = 1
            for dx in range(-r, r + 1):
                nx = x + dx
                if not (x0 <= nx < x1 and src[b + nx]):
                    on = 0; break
            horiz[b + x] = on
    out = bytearray(w * h)
    for x in range(x0, x1):
        for y in range(y0, y1):
            on = 1
            for dy in range(-r, r + 1):
                ny = y + dy
                if not (y0 <= ny < y1 and horiz[ny * w + x]):
                    on = 0; break
            out[y * w + x] = on
    return out

R = 3
mask = erode(dilate(mask, R), R)

# ---- largest connected component (4-conn) ----
label = bytearray(w * h)
best = []
for y in range(y0, y1):
    for x in range(x0, x1):
        idx = y * w + x
        if mask[idx] and not label[idx]:
            comp = []
            stack = [idx]
            label[idx] = 1
            while stack:
                ci = stack.pop()
                comp.append(ci)
                cy, cx = divmod(ci, w)
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = cy + dy, cx + dx
                    if x0 <= nx < x1 and y0 <= ny < y1:
                        ni = ny * w + nx
                        if mask[ni] and not label[ni]:
                            label[ni] = 1
                            stack.append(ni)
            if len(comp) > len(best):
                best = comp
print("largest comp", len(best))

fg = bytearray(w * h)
for ci in best:
    fg[ci] = 1

def fgp(x, y):
    return 0 <= x < w and 0 <= y < h and fg[y * w + x]

# ---- Moore-neighbor boundary tracing (clockwise) ----
start = None
for y in range(y0, y1):
    for x in range(x0, x1):
        if fg[y * w + x]:
            start = (x, y); break
    if start:
        break
offs = [(0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0), (-1, -1)]
def idx_of(d):
    return offs.index(d)
boundary = [start]
cur = start
b = (start[0] - 1, start[1])
safety = 0
while True:
    cx, cy = cur
    bx, by = b
    si = (idx_of((bx - cx, by - cy)) + 1) % 8
    found = None
    for k in range(8):
        i = (si + k) % 8
        dx, dy = offs[i]
        nx, ny = cx + dx, cy + dy
        if fgp(nx, ny):
            found = (nx, ny)
            pdx, pdy = offs[(i - 1) % 8]
            b = (cx + pdx, cy + pdy)
            break
    if found is None:
        break
    cur = found
    boundary.append(cur)
    safety += 1
    if cur == start and len(boundary) > 3:
        break
    if safety > 8 * (w + h) * 6:
        print("trace safety hit")
        break
print("boundary pts", len(boundary))

# ---- RDP simplify (iterative) ----
def rdp(pts, eps):
    if len(pts) < 3:
        return pts[:]
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, c = stack.pop()
        ax, ay = pts[a]; cx, cy = pts[c]
        dx, dy = cx - ax, cy - ay
        d2 = dx * dx + dy * dy or 1e-9
        dmax = 0; idx = -1
        for i in range(a + 1, c):
            pxx, pyy = pts[i]
            t = ((pxx - ax) * dx + (pyy - ay) * dy) / d2
            projx, projy = ax + t * dx, ay + t * dy
            dist = (pxx - projx) ** 2 + (pyy - projy) ** 2
            if dist > dmax:
                dmax = dist; idx = i
        if dmax > eps * eps and idx != -1:
            keep[idx] = True
            stack.append((a, idx)); stack.append((idx, c))
    return [pts[i] for i in range(len(pts)) if keep[i]]

simp = rdp(boundary, 2.0)
print("simplified pts", len(simp))

xs = [p[0] for p in simp]; ys = [p[1] for p in simp]
minx, miny, maxx, maxy = min(xs), min(ys), max(xs), max(ys)
bw, bh = maxx - minx, maxy - miny
print("bbox px", minx, miny, maxx, maxy, "size", bw, bh)

# path d normalized to bbox origin
d = "M " + " L ".join(f"{p[0]-minx:.1f},{p[1]-miny:.1f}" for p in simp) + " Z"
with open(OUT + "/region_d.txt", "w") as f:
    f.write(d)
with open(OUT + "/region.svg", "w") as f:
    f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {bw} {bh}" width="{bw}" height="{bh}">'
            f'<rect width="{bw}" height="{bh}" fill="#fff"/>'
            f'<path d="{d}" fill="#0a1124" stroke="#38d6ff" stroke-width="2"/></svg>')

# ---- overlay boundary on rendered map for verification ----
for (x, y) in boundary:
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            xx, yy = x + dx, y + dy
            if 0 <= xx < w and 0 <= yy < h:
                pix.set_pixel(xx, yy, (255, 40, 40))
for (x, y) in simp:
    for dx in (-2, -1, 0, 1, 2):
        for dy in (-2, -1, 0, 1, 2):
            xx, yy = x + dx, y + dy
            if 0 <= xx < w and 0 <= yy < h:
                pix.set_pixel(xx, yy, (40, 230, 90))
pix.save(OUT + "/overlay.png")

# ---- labels: words inside bbox, scaled to bbox coords ----
words = page.get_text("words")
labels = []
for (wx0, wy0, wx1, wy1, txt, *_rest) in words:
    cx = (wx0 + wx1) / 2 * Z
    cy = (wy0 + wy1) / 2 * Z
    if minx - 4 <= cx <= maxx + 4 and miny - 4 <= cy <= maxy + 4:
        labels.append({"t": txt, "x": round(cx - minx, 1), "y": round(cy - miny, 1)})
with open(OUT + "/labels.json", "w") as f:
    json.dump({"viewBox": [0, 0, bw, bh], "labels": labels}, f, indent=1)
print("labels inside bbox:", len(labels))

# ---- curated suburb labels via point-in-polygon ----
poly = simp  # list of (x,y) image px
def inside(px_, py_):
    c = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]; xj, yj = poly[j]
        if ((yi > py_) != (yj > py_)) and (px_ < (xj - xi) * (py_ - yi) / ((yj - yi) or 1e-9) + xi):
            c = not c
        j = i
    return c

# collect all words with image-px centre, inside polygon
wp = []
for (wx0, wy0, wx1, wy1, txt, *_r) in words:
    cx = (wx0 + wx1) / 2 * Z
    cy = (wy0 + wy1) / 2 * Z
    if inside(cx, cy):
        wp.append((txt.lower(), cx, cy, txt))

curated = []
def add(name, cx, cy):
    curated.append({"name": name, "x": round(cx - minx, 1), "y": round(cy - miny, 1)})

simple = [
    ("Whenuapai", ["henuapai", "whenuapai"]),
    ("Hobsonville", ["hobsonville"]),
    ("Greenhithe", ["greenhithe"]),
    ("Albany", ["albany"]),
    ("Rosedale", ["rosedale"]),
    ("Schnapper Rock", ["schnapper"]),
    ("Pinehill", ["pinehill"]),
    ("Windsor Park", ["indsor", "windsor"]),
    ("Unsworth Heights", ["unsworth"]),
    ("Northcross", ["northcross"]),
    ("Oteha", ["oteha"]),
    ("Paremoremo", ["paremoremo"]),
]
for name, toks in simple:
    for (lt, cx, cy, raw) in wp:
        if any(t in lt for t in toks):
            add(name, cx, cy); break

# West Harbour: the "Harbour" word furthest west inside polygon
harb = [(cx, cy) for (lt, cx, cy, raw) in wp if "harbour" in lt]
if harb:
    cx, cy = min(harb, key=lambda p: p[0])
    add("West Harbour", cx, cy)

with open(OUT + "/curated_labels.json", "w") as f:
    json.dump({"viewBox": [0, 0, round(bw, 1), round(bh, 1)], "labels": curated}, f, indent=1)
print("curated:", [(c["name"], c["x"], c["y"]) for c in curated])
