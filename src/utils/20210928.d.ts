/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This schema describes version 20210928 of the OURZ Metadata Standard
 */
export interface Ourz20210928 {
  /**
   * The name or title of the Media
   */
  name: string;
  /**
   * The description of the media
   */
  description: string;
  /**
   * The title of the collection this NFT belongs to, if any
   */
  collection_title?: string;
  /**
   * The mimeType of the media
   */
  mimeType: string;
  /**
   * The category/genre/kind of cryptomedia
   */
  category?: string;
  /**
   * The material and/or tools used by the creator(s) to create the cryptomedia
   */
  medium?: string;
  /**
   * Royalty information for the Split Contract that minted the cryptomedia
   */
  split_recipients: Contributor[];
  /**
   * This property defines the calendar version of the schema so that consumers can correctly parse the json
   */
  version: string;
  /**
   * An optional preview image URL for the media
   */
  image?: string;
  /**
   * This property defines an optional external URL that can reference a webpage or external asset for the NFT
   */
  external_url?: string;
  /**
   * A URL to a multi-media attachment for the item. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA. Animation_url also supports HTML pages, allowing you to build rich experiences using JavaScript canvas, WebGL, and more. Access to browser extensions is not supported
   */
  animation_url?: string;
  /**
   * Fields pertaining to copyright & licensing, optional
   */
  copyright_info?: {
    /**
     * The party (organization or person) holding the legal copyright to the cryptomedia.
     */
    copyright_holder?: string;
    /**
     * The year during which the claimed copyright for the cryptomedia was first asserted.
     */
    copyright_year?: string;
    /**
     * Text of a notice appropriate for describing the copyright aspects of this cryptomedia, ideally indicating the owner of the copyright for the media.
     */
    copyright_notice?: string;
    /**
     * A license document that applies to the cryptomedia, typically indicated by URL.
     */
    license?: string;
    [k: string]: unknown;
  };
  /**
   * Indicates whether this cryptomedia contains explicit content.
   */
  explicit_content?: boolean;
  /**
   * This property defines any additional attributes for the item; see https://schema.org/CreativeWork for ideas
   */
  attributes?: Attribute[];
}
export interface Contributor {
  /**
   * Contributor/SplitRecipient's Ethereum wallet address converted to lowercase
   */
  account: string;
  /**
   * Contributor/SplitRecipient's name or alias
   */
  name?: string;
  /**
   * Contributor/SplitRecipient's role in the creation of the NFT
   */
  role?: string;
  /**
   * Contributor/SplitRecipient's allotted shares out of 100;
   */
  shares?: string;
  /**
   * Shares represented as a BigInt; (shares * 1,000,000)
   */
  allocation: string;
  [k: string]: unknown;
}
export interface Attribute {
  /**
   * The name of the trait
   */
  trait_type: string;
  /**
   * The value of the trait
   */
  value: string | number | boolean;
  /**
   * A field indicating how the `value` data should be displayed. Defaults to 'string'
   */
  display_type?: string;
  [k: string]: unknown;
}