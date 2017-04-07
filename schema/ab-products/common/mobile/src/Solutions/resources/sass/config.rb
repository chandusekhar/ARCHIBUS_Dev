# Get the directory that this configuration file exists in
dir = File.dirname(__FILE__)

# Load the sencha-touch framework automatically.
load File.join(dir, '..', '..', '../touch', 'resources', 'themes')

common_sass_dir = File.join(dir, '..', '..', '../Common', 'resources', 'sass')

add_import_path common_sass_dir

# Compass configurations
sass_path = dir
css_path = File.join(dir, "..", "css")
fonts_path = File.join('..', '..', '../Common', 'resources', 'sass', 'fonts')

# Require any additional compass plugins here.
images_dir = File.join(dir, "..", "images")
output_style = :compressed
environment = :production
