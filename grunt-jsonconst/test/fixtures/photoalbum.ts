    /**
     * Photo album metadata:
     * Describes a photo album, and metadata about the images in it
     */
    export abstract class PhotoAlbum
    {
        /**
         * Album name:
         * The name of the photo album
         */
        public abstract get name(): string;
        /**
         * Photos in the album:
         * Describes each of the photos in the album
         */
        public abstract get images(): ImageMetaData[];
    }

    /**
     * 0 schema.:
     * An explanation about the purpose of this instance.
     */
    export abstract class ImageMetaData
    {
        /**
         * Date schema.:
         * An explanation about the purpose of this instance.
         */
        public abstract get date(): string;
        /**
         * Photographer schema.:
         * An explanation about the purpose of this instance.
         */
        public abstract get photographer(): string;
    }


    class PhotoAlbum1 extends PhotoAlbum
    {
        public get name(): string
        {
            return "Album 1";
        }
        public get images(): ImageMetaData[]
        {
            return [new ImageMetaData2(), ];
        }
    }

    class ImageMetaData2 extends ImageMetaData
    {
        public get date(): string
        {
            return "March 72";
        }
        public get photographer(): string
        {
            return "Thomas";
        }
    }


    export default new PhotoAlbum1();
