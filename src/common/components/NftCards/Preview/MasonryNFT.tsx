/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Link from "next/link"; // Dynamic routing
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react"; // React state management
import { NFTCard } from "@/modules/subgraphs/utils";

interface NextImageOnLoad {
  naturalWidth: number;
  naturalHeight: number;
}

const MasonryNFT = ({ post, networkId }: { post: NFTCard; networkId: number }): JSX.Element => {
  const { tokenId } = post;
  const ref = useRef<HTMLVideoElement>();

  /**       ---  Dual-axis Masonry Layout  ---
   * For Landing Page: hide posts until they are loaded
   * and then set classname of "`orientation`-`ratio`"
   */
  const [aspectRatio, setAspectRatio] = useState("");

  const calcAspectRatio = (
    loadedMedia: NextImageOnLoad | React.SyntheticEvent<HTMLVideoElement, Event>
  ): void => {
    // infinite loop control
    if (!aspectRatio) {
      let ratio;
      let width;
      let height;

      if (loadedMedia?.naturalWidth) {
        // Photo
        width = loadedMedia.naturalWidth;
        height = loadedMedia.naturalHeight;
        ratio = width / height;
      } else if (loadedMedia?.target) {
        // Video
        width = Number(loadedMedia.target.videoWidth);
        height = Number(loadedMedia.target.videoHeight);
        ratio = width / height;
      } else {
        setAspectRatio("hidden");
      }

      if (ratio > 0.8 && ratio < 1.24) {
        // Mostly Square
        setAspectRatio("square");
      }

      if (ratio > 1.21) {
        // landscape
        if (ratio < 1.3) {
          setAspectRatio("landscape-4x5");
        } else if (ratio < 1.385) {
          setAspectRatio("landscape-3x4");
        } else if (ratio < 1.5) {
          setAspectRatio("landscape-5x7");
        } else if (ratio < 1.68) {
          setAspectRatio("landscape-2x3");
        } else if (ratio < 1.9) {
          setAspectRatio("landscape-9x16");
        } else if (ratio < 2.5) {
          setAspectRatio("landscape-2x1");
        } else {
          setAspectRatio("landscape-widest");
        }
      }

      if (ratio <= 0.83) {
        // portrait
        if (ratio >= 0.765) {
          setAspectRatio("portrait-4x5");
        } else if (ratio >= 0.735) {
          setAspectRatio("portrait-3x4");
        } else if (ratio >= 0.685) {
          setAspectRatio("portrait-5x7");
        } else if (ratio >= 0.605) {
          setAspectRatio("portrait-2x3");
        } else if (ratio >= 0.53) {
          setAspectRatio("portrait-9x16");
        } else if (ratio > 0.41) {
          setAspectRatio("portrait-2x1");
        } else {
          setAspectRatio("portrait-tallest");
        }
      }
    }
  };

  useEffect(() => {
    if (ref?.current && ref.current?.videoWidth) {
      const videoDimensions = {
        target: {
          videoWidth: ref.current.videoWidth,
          videoHeight: ref.current.videoHeight,
        },
      };
      calcAspectRatio(videoDimensions as unknown as React.SyntheticEvent<HTMLVideoElement>);
    }
  });

  if (post?.mimeType?.includes("video")) {
    return (
      <div key={tokenId} className={`m-2 cursor-pointer ${aspectRatio} landingPage-item`}>
        <div className="flex flex-col w-full h-full cursor-pointer">
          <Link
            href={{
              pathname: `/${networkId ?? 1}/nft/[tokenId]`,
              query: { tokenId },
            }}
            passHref
          >
            <div className="object-cover relative w-full h-full bg-transparent">
              {post.contentURI && (
                <video
                  // width={480}
                  lazy="true"
                  ref={ref}
                  muted
                  onLoadedMetadata={(loadedMedia) => calcAspectRatio(loadedMedia)}
                  onLoadedData={(loadedMedia) => calcAspectRatio(loadedMedia)}
                  onLoad={(loadedMedia) => calcAspectRatio(loadedMedia)}
                  autoPlay
                  controls={false}
                  playsInline
                >
                  <source
                    onLoadedMetadata={(loadedMedia) => calcAspectRatio(loadedMedia)}
                    onLoadedData={(loadedMedia) => calcAspectRatio(loadedMedia)}
                    onLoad={(loadedMedia) => calcAspectRatio(loadedMedia)}
                    src={post.contentURI}
                  />
                </video>
              )}
            </div>
          </Link>
        </div>
      </div>
    );
  }
  if (post?.mimeType?.includes("image")) {
    return (
      <div className={`m-2 cursor-pointer ${aspectRatio} landingPage-item`}>
        <div className="flex flex-col w-full h-full xl:h-full">
          <Link
            href={{
              pathname: `/${networkId ?? 1}/nft/[tokenId]`,
              query: { tokenId },
            }}
            passHref
          >
            <div className="object-cover relative w-full h-full bg-transparent">
              {post.contentURI && (
                <Image
                  alt={`NFT #${tokenId} Thumbnail`}
                  layout="fill"
                  objectFit="contain"
                  quality={25}
                  src={post.contentURI}
                  placeholder="empty"
                  className="w-full h-full"
                  // sizes="50vw"
                  onLoadingComplete={(loadedMedia) => calcAspectRatio(loadedMedia)}
                />
              )}
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line no-console
  console.log(`Error Displaying Token #${post.tokenId}`);
  return <></>;
};

export default MasonryNFT;
