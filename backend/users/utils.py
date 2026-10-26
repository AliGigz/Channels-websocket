import hashlib


def generate_profile_picture_path(instance, filename) -> str:
    filename, ext = filename.split(".")
    hashed_filename = hashlib.sha256(filename.encode()).hexdigest()
    return f"{instance.username}/profiles/{hashed_filename}.{ext}"

