namespace x
{
    /// <summary>
    /// Photo album metadata:
    /// Describes a photo album, and metadata about the images in it
    /// </summary>
    public interface PhotoAlbum
    {
        /// <summary>
        /// Album name:
        /// The name of the photo album
        /// </summary>
        string name { get; } 
        /// <summary>
        /// Photos in the album:
        /// Describes each of the photos in the album
        /// </summary>
        ImageMetaData[] images { get; } 
    }

    /// <summary>
    /// 0 schema.:
    /// An explanation about the purpose of this instance.
    /// </summary>
    public interface ImageMetaData
    {
        /// <summary>
        /// Date schema.:
        /// An explanation about the purpose of this instance.
        /// </summary>
        string date { get; } 
        /// <summary>
        /// Photographer schema.:
        /// An explanation about the purpose of this instance.
        /// </summary>
        string photographer { get; } 
    }


    class PhotoAlbum1: PhotoAlbum
    {
        public string name
        {
            get
            {
                return "Album 1";
            }
        }
        
        public ImageMetaData[] images
        {
            get
            {
                return new ImageMetaData[] { new ImageMetaData2(), };
            }
        }
        
    }

    class ImageMetaData2: ImageMetaData
    {
        public string date
        {
            get
            {
                return "March 72";
            }
        }
        
        public string photographer
        {
            get
            {
                return "Thomas";
            }
        }
        
    }


    const PhotoAlbum y = new PhotoAlbum1();
}
