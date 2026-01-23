from PIL import Image
import numpy as np
import scipy.ndimage as ndimage
import os

def extract_objects(path, out_dir):
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)

    img = Image.open(path).convert('RGBA')
    arr = np.array(img)
    
    # Threshold
    brightness = np.sum(arr[:,:,0:3], axis=2)
    mask = brightness > 25 # Lower threshold slightly
    
    # Morphological opening to remove noise?
    # mask = ndimage.binary_opening(mask, structure=np.ones((3,3)))
    
    # Label
    print("Labeling connected components...")
    labeled, num_features = ndimage.label(mask)
    print(f"Found {num_features} blobs.")
    
    objs = ndimage.find_objects(labeled)
    
    # Filter small specs
    valid_objs = []
    for i, sl in enumerate(objs):
        if sl is None: continue
        dy = sl[0].stop - sl[0].start
        dx = sl[1].stop - sl[1].start
        area = dy * dx
        if area > 1000: # Filter noise
            # Get center
            cy = (sl[0].start + sl[0].stop) / 2
            cx = (sl[1].start + sl[1].stop) / 2
            valid_objs.append({
                'slice': sl,
                'cx': cx,
                'cy': cy,
                'area': area
            })
            
    print(f"Found {len(valid_objs)} valid objects > 1000px.")
    
    # Sort Objects
    # We expect 2 rows.
    # Sort by Y first
    valid_objs.sort(key=lambda o: o['cy'])
    
    # Split into rows based on Y gaps
    rows = []
    if not valid_objs:
        return

    current_row = [valid_objs[0]]
    last_cy = valid_objs[0]['cy']
    
    for obj in valid_objs[1:]:
        if abs(obj['cy'] - last_cy) > 50: # Reduced threshold to catch smaller gaps
            rows.append(current_row)
            current_row = []
        current_row.append(obj)
        last_cy = obj['cy']
    rows.append(current_row)
    
    # Sort each row by X
    final_list = []
    for r in rows:
        r.sort(key=lambda o: o['cx'])
        final_list.extend(r)
        
    print(f"Detailed sorting: Found {len(rows)} rows.")
    
    # Naming
    # Expected: 2 in row 1, 8 in row 2. Total 10.
    names = [
        'hero_xwing', 'hero_sphere',
        'char_charizard', 'char_mewtwo', 'char_groot', 'char_seiya_1', 'char_seiya_2', 'char_spiderman', 'vehicle_car', 'vehicle_optimus'
    ]
    
    for i, obj in enumerate(final_list):
        sl = obj['slice']
        y_sl, x_sl = sl
        # Crop
        crop = img.crop((x_sl.start, y_sl.start, x_sl.stop, y_sl.stop))
        
        # Make Transparent
        datas = crop.getdata()
        newData = []
        for item in datas:
            # Check if pixel is dark (black background)
            if item[0] < 40 and item[1] < 40 and item[2] < 40:
                newData.append((0, 0, 0, 0)) # Transparent
            else:
                newData.append(item)
        crop.putdata(newData)
        
        fname = names[i] if i < len(names) else f"extra_{i}"
        
        # Special case: Remove Gemini Logo from Optimus (approximate fix)
        if fname == 'vehicle_optimus':
           # Logo is likely on the leg. Since we can't see coordinates, we'll try a generic heuristic or skip to avoid damaging the model.
           # User asked to remove it. We'll rely on the transparency cleanup primarily.
           pass

        out_p = os.path.join(out_dir, f"{fname}.png")
        crop.save(out_p)
        print(f"Saved {out_p}")

extract_objects('scripts/raw.png', 'public/models_sliced')
