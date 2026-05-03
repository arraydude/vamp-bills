"""Build a valid .excalidraw file for the Bill Lifecycle diagram.

The MCP renderer accepts a condensed format (with `label` shortcuts) that
excalidraw.com itself does not. This script expands shapes/arrows with
`label` into proper bound text elements and fills in all required fields.

Usage:
    python scripts/build_lifecycle_excalidraw.py
"""

from __future__ import annotations

import json
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "docs/diagrams/bill-payment-lifecycle.excalidraw"


def rand() -> int:
    return random.randint(1, 2**31 - 1)


# Condensed elements (same as the create_view input). The cameraUpdate is
# stripped because it's an MCP-only pseudo-element.
CONDENSED = [
    {"type": "text", "id": "t", "x": 420, "y": 25, "text": "vamp-bills — Bill Lifecycle", "fontSize": 24, "strokeColor": "#1e1e1e"},
    {"type": "text", "id": "st", "x": 350, "y": 58, "text": "Mirror of the ASCII state machine in docs/mvp-scope.md (lines 86–110)", "fontSize": 14, "strokeColor": "#757575"},
    {"type": "rectangle", "id": "man", "x": 285, "y": 110, "width": 170, "height": 50, "backgroundColor": "#a5d8ff", "fillStyle": "solid", "strokeColor": "#4a9eed", "roundness": {"type": 3}, "label": {"text": "Manual entry", "fontSize": 18}},
    {"type": "rectangle", "id": "csv", "x": 515, "y": 110, "width": 170, "height": 50, "backgroundColor": "#a5d8ff", "fillStyle": "solid", "strokeColor": "#4a9eed", "roundness": {"type": 3}, "label": {"text": "CSV bulk", "fontSize": 18}},
    {"type": "rectangle", "id": "ai", "x": 745, "y": 110, "width": 170, "height": 50, "backgroundColor": "#a5d8ff", "fillStyle": "solid", "strokeColor": "#4a9eed", "roundness": {"type": 3}, "label": {"text": "AI invoice fill", "fontSize": 18}},
    {"type": "rectangle", "id": "dz", "x": 330, "y": 190, "width": 540, "height": 110, "backgroundColor": "#fff3bf", "fillStyle": "solid", "strokeColor": "#f59e0b", "strokeWidth": 1, "strokeStyle": "dashed", "opacity": 40, "roundness": {"type": 3}},
    {"type": "text", "id": "dzl", "x": 580, "y": 196, "text": "DRAFT", "fontSize": 16, "strokeColor": "#a16207"},
    {"type": "rectangle", "id": "mi", "x": 350, "y": 225, "width": 200, "height": 55, "backgroundColor": "#ffd8a8", "fillStyle": "solid", "strokeColor": "#f59e0b", "roundness": {"type": 3}, "label": {"text": "Missing Info", "fontSize": 18}},
    {"type": "rectangle", "id": "rd", "x": 650, "y": 225, "width": 200, "height": 55, "backgroundColor": "#b2f2bb", "fillStyle": "solid", "strokeColor": "#22c55e", "roundness": {"type": 3}, "label": {"text": "Ready", "fontSize": 18}},
    {"type": "arrow", "id": "mi2rd", "x": 550, "y": 252, "width": 100, "height": 0, "points": [[0, 0], [100, 0]], "strokeColor": "#1e1e1e", "endArrowhead": "arrow", "label": {"text": "user edits", "fontSize": 14}, "startBinding": {"elementId": "mi", "fixedPoint": [1, 0.5]}, "endBinding": {"elementId": "rd", "fixedPoint": [0, 0.5]}},
    {"type": "arrow", "id": "a1", "x": 370, "y": 160, "width": 80, "height": 65, "points": [[0, 0], [80, 65]], "strokeColor": "#1e1e1e", "endArrowhead": "arrow", "startBinding": {"elementId": "man", "fixedPoint": [0.5, 1]}, "endBinding": {"elementId": "mi", "fixedPoint": [0.5, 0]}},
    {"type": "arrow", "id": "a2", "x": 600, "y": 160, "width": 0, "height": 30, "points": [[0, 0], [0, 30]], "strokeColor": "#1e1e1e", "endArrowhead": "arrow", "startBinding": {"elementId": "csv", "fixedPoint": [0.5, 1]}, "endBinding": {"elementId": "dz", "fixedPoint": [0.5, 0]}},
    {"type": "arrow", "id": "a3", "x": 830, "y": 160, "width": 80, "height": 65, "points": [[0, 0], [-80, 65]], "strokeColor": "#1e1e1e", "endArrowhead": "arrow", "startBinding": {"elementId": "ai", "fixedPoint": [0.5, 1]}, "endBinding": {"elementId": "rd", "fixedPoint": [0.5, 0]}},
    {"type": "rectangle", "id": "aa", "x": 500, "y": 370, "width": 200, "height": 55, "backgroundColor": "#d0bfff", "fillStyle": "solid", "strokeColor": "#8b5cf6", "roundness": {"type": 3}, "label": {"text": "Awaiting approval", "fontSize": 18}},
    {"type": "arrow", "id": "sub", "x": 750, "y": 280, "width": 150, "height": 90, "points": [[0, 0], [-150, 90]], "strokeColor": "#1e1e1e", "endArrowhead": "arrow", "label": {"text": "Submit", "fontSize": 14}, "startBinding": {"elementId": "rd", "fixedPoint": [0.5, 1]}, "endBinding": {"elementId": "aa", "fixedPoint": [0.5, 0]}},
    {"type": "rectangle", "id": "app", "x": 390, "y": 490, "width": 170, "height": 55, "backgroundColor": "#b2f2bb", "fillStyle": "solid", "strokeColor": "#22c55e", "roundness": {"type": 3}, "label": {"text": "Approved", "fontSize": 18}},
    {"type": "rectangle", "id": "rej", "x": 640, "y": 490, "width": 170, "height": 55, "backgroundColor": "#ffc9c9", "fillStyle": "solid", "strokeColor": "#ef4444", "roundness": {"type": 3}, "label": {"text": "Rejected", "fontSize": 18}},
    {"type": "arrow", "id": "appr", "x": 560, "y": 425, "width": 85, "height": 65, "points": [[0, 0], [-85, 65]], "strokeColor": "#22c55e", "endArrowhead": "arrow", "label": {"text": "Approve", "fontSize": 14}, "startBinding": {"elementId": "aa", "fixedPoint": [0.3, 1]}, "endBinding": {"elementId": "app", "fixedPoint": [0.5, 0]}},
    {"type": "arrow", "id": "rejr", "x": 640, "y": 425, "width": 85, "height": 65, "points": [[0, 0], [85, 65]], "strokeColor": "#ef4444", "endArrowhead": "arrow", "label": {"text": "Reject", "fontSize": 14}, "startBinding": {"elementId": "aa", "fixedPoint": [0.7, 1]}, "endBinding": {"elementId": "rej", "fixedPoint": [0.5, 0]}},
    {"type": "arrow", "id": "resub", "x": 810, "y": 517, "width": 110, "height": 120, "points": [[0, 0], [-110, -120]], "strokeColor": "#8b5cf6", "strokeStyle": "dashed", "endArrowhead": "arrow", "label": {"text": "Edit & resubmit", "fontSize": 14}, "startBinding": {"elementId": "rej", "fixedPoint": [1, 0.5]}, "endBinding": {"elementId": "aa", "fixedPoint": [1, 0.5]}},
    {"type": "rectangle", "id": "ap", "x": 500, "y": 610, "width": 200, "height": 55, "backgroundColor": "#d0bfff", "fillStyle": "solid", "strokeColor": "#8b5cf6", "roundness": {"type": 3}, "label": {"text": "Awaiting payment", "fontSize": 18}},
    {"type": "arrow", "id": "a2p", "x": 475, "y": 545, "width": 125, "height": 65, "points": [[0, 0], [125, 65]], "strokeColor": "#1e1e1e", "endArrowhead": "arrow", "startBinding": {"elementId": "app", "fixedPoint": [0.5, 1]}, "endBinding": {"elementId": "ap", "fixedPoint": [0.5, 0]}},
    {"type": "arrow", "id": "editf", "x": 500, "y": 637, "width": 160, "height": 240, "points": [[0, 0], [-160, 0], [-160, -240], [0, -240]], "strokeColor": "#ef4444", "strokeStyle": "dashed", "endArrowhead": "arrow", "label": {"text": "Edit any field", "fontSize": 14}, "startBinding": {"elementId": "ap", "fixedPoint": [0, 0.5]}, "endBinding": {"elementId": "aa", "fixedPoint": [0, 0.5]}},
    {"type": "rectangle", "id": "pd", "x": 390, "y": 740, "width": 170, "height": 55, "backgroundColor": "#b2f2bb", "fillStyle": "solid", "strokeColor": "#22c55e", "strokeWidth": 3, "roundness": {"type": 3}, "label": {"text": "Paid", "fontSize": 18}},
    {"type": "rectangle", "id": "ar", "x": 640, "y": 740, "width": 170, "height": 55, "backgroundColor": "#e9ecef", "fillStyle": "solid", "strokeColor": "#757575", "roundness": {"type": 3}, "label": {"text": "Archived", "fontSize": 18}},
    {"type": "arrow", "id": "mp", "x": 560, "y": 665, "width": 85, "height": 75, "points": [[0, 0], [-85, 75]], "strokeColor": "#22c55e", "endArrowhead": "arrow", "label": {"text": "Mark as paid", "fontSize": 14}, "startBinding": {"elementId": "ap", "fixedPoint": [0.3, 1]}, "endBinding": {"elementId": "pd", "fixedPoint": [0.5, 0]}},
    {"type": "arrow", "id": "arch", "x": 640, "y": 665, "width": 85, "height": 75, "points": [[0, 0], [85, 75]], "strokeColor": "#757575", "endArrowhead": "arrow", "label": {"text": "Archive", "fontSize": 14}, "startBinding": {"elementId": "ap", "fixedPoint": [0.7, 1]}, "endBinding": {"elementId": "ar", "fixedPoint": [0.5, 0]}},
    {"type": "text", "id": "fn", "x": 300, "y": 825, "text": "Approving auto-creates a Payment (status=pending). Archive cancels any open Payment.", "fontSize": 14, "strokeColor": "#757575"},
]


def base_fields(el: dict) -> dict:
    return {
        "id": el["id"],
        "type": el["type"],
        "x": el["x"],
        "y": el["y"],
        "width": el.get("width", 0),
        "height": el.get("height", 0),
        "angle": 0,
        "strokeColor": el.get("strokeColor", "#1e1e1e"),
        "backgroundColor": el.get("backgroundColor", "transparent"),
        "fillStyle": el.get("fillStyle", "solid"),
        "strokeWidth": el.get("strokeWidth", 2),
        "strokeStyle": el.get("strokeStyle", "solid"),
        "roughness": el.get("roughness", 1),
        "opacity": el.get("opacity", 100),
        "groupIds": [],
        "frameId": None,
        "index": None,
        "roundness": el.get("roundness"),
        "seed": rand(),
        "version": 1,
        "versionNonce": rand(),
        "isDeleted": False,
        "boundElements": [],
        "updated": 1,
        "link": None,
        "locked": False,
    }


def text_fields(text: str, font_size: int, container_id: str | None) -> dict:
    return {
        "text": text,
        "fontSize": font_size,
        "fontFamily": 5,  # Excalifont (current default in v0.18+)
        "textAlign": "center" if container_id else "left",
        "verticalAlign": "middle" if container_id else "top",
        "baseline": int(font_size * 0.85),
        "containerId": container_id,
        "originalText": text,
        "autoResize": True,
        "lineHeight": 1.25,
    }


def text_dimensions(text: str, font_size: int) -> tuple[float, float]:
    # Rough estimate that's good enough for Excalidraw to position bound text.
    # Excalidraw will recompute on load.
    longest_line = max(len(line) for line in text.split("\n"))
    return longest_line * font_size * 0.55, font_size * 1.25 * len(text.split("\n"))


def expand() -> list[dict]:
    out: list[dict] = []
    bound_text_elements: list[dict] = []
    container_to_text: dict[str, str] = {}

    # First pass: build full versions of every condensed element.
    for el in CONDENSED:
        full = base_fields(el)

        if el["type"] == "text":
            tf = text_fields(el["text"], el.get("fontSize", 20), None)
            full.update(tf)
            tw, th = text_dimensions(el["text"], el.get("fontSize", 20))
            full["width"] = el.get("width", tw)
            full["height"] = el.get("height", th)

        elif el["type"] == "arrow":
            full.update({
                "points": el["points"],
                "lastCommittedPoint": None,
                "startBinding": el.get("startBinding"),
                "endBinding": el.get("endBinding"),
                "startArrowhead": el.get("startArrowhead"),
                "endArrowhead": el.get("endArrowhead", "arrow"),
                "elbowed": False,
            })

        out.append(full)

        # If element has a `label`, build a bound text element for it.
        label = el.get("label")
        if label:
            text_id = f"label_{el['id']}"
            container_to_text[el["id"]] = text_id

            fs = label.get("fontSize", 16)
            tw, th = text_dimensions(label["text"], fs)

            if el["type"] == "arrow":
                # Approximate arrow midpoint in scene coords.
                pts = el["points"]
                mid_idx = len(pts) // 2
                if len(pts) % 2 == 0 and len(pts) >= 2:
                    a, b = pts[mid_idx - 1], pts[mid_idx]
                    mx = (a[0] + b[0]) / 2
                    my = (a[1] + b[1]) / 2
                else:
                    mx, my = pts[mid_idx][0], pts[mid_idx][1]
                cx = el["x"] + mx
                cy = el["y"] + my
            else:
                cx = el["x"] + el["width"] / 2
                cy = el["y"] + el["height"] / 2

            text_full = base_fields({"id": text_id, "type": "text", "x": cx - tw / 2, "y": cy - th / 2, "width": tw, "height": th, "strokeColor": "#1e1e1e"})
            text_full.update(text_fields(label["text"], fs, el["id"]))
            bound_text_elements.append(text_full)

    # Second pass: wire boundElements references on containers.
    by_id = {e["id"]: e for e in out}
    for cid, tid in container_to_text.items():
        by_id[cid]["boundElements"].append({"id": tid, "type": "text"})

    # Wire arrow start/end bindings into the container's boundElements too.
    for e in out:
        if e["type"] != "arrow":
            continue
        for binding_key in ("startBinding", "endBinding"):
            b = e.get(binding_key)
            if b and b["elementId"] in by_id:
                by_id[b["elementId"]]["boundElements"].append({"id": e["id"], "type": "arrow"})

    return out + bound_text_elements


def main() -> None:
    elements = expand()
    doc = {
        "type": "excalidraw",
        "version": 2,
        "source": "https://excalidraw.com",
        "elements": elements,
        "appState": {
            "viewBackgroundColor": "#ffffff",
            "gridSize": None,
            "gridStep": 5,
        },
        "files": {},
    }
    OUT.write_text(json.dumps(doc, indent=2), encoding="utf-8")
    print(f"Wrote {OUT}  ({len(elements)} elements)")


if __name__ == "__main__":
    main()
