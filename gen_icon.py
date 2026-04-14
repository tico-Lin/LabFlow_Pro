import struct
import os

def create_basic_ico(output_path):
    # ICO Header: Reserved (0), Type (1 for ico), Count (1 image)
    header = struct.pack('<HHH', 0, 1, 1)
    
    # Icon Directory Entry
    width = 32
    height = 32
    colors = 0  # Not using a palette
    reserved = 0
    planes = 1  # Color planes
    bpp = 32    # Bits per pixel (RGBA)
    
    # Simple raw BMP (DIB) payload size calculation
    # DIB Header (40 bytes) + Pixel data (32*32*4 bytes) + Mask (32*32/8 bytes)
    dib_header_size = 40
    pixel_data_size = width * height * 4
    mask_data_size = (width * height) // 8
    image_data_size = dib_header_size + pixel_data_size + mask_data_size
    
    # Offset from start of file (Header 6 bytes + Directory 16 bytes = 22)
    offset = 22
    
    directory = struct.pack('<BBBBHHII', width, height, colors, reserved, planes, bpp, image_data_size, offset)
    
    # DIB Header (BITMAPINFOHEADER)
    dib_header = struct.pack('<IiiHHIIiiII', dib_header_size, width, height * 2, 1, 32, 0, pixel_data_size + mask_data_size, 0, 0, 0, 0)
    
    # Pixel Data (Blue, Green, Red, Alpha) - Simple blue semi-transparent block
    pixels = bytearray([255, 0, 0, 128] * (width * height))
    
    # Mask Data (1 bit per pixel, 0 means opaque/use pixel data)
    mask = bytearray([0] * mask_data_size)
    
    with open(output_path, 'wb') as f:
        f.write(header)
        f.write(directory)
        f.write(dib_header)
        f.write(pixels)
        f.write(mask)
    print(f"✅ Successfully generated a valid Windows .ico at {output_path}")

target_dir = 'ui-desktop/src-tauri/icons'
os.makedirs(target_dir, exist_ok=True)
create_basic_ico(os.path.join(target_dir, 'icon.ico'))
