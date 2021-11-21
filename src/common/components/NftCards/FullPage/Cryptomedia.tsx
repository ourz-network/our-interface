import { useContext, useState } from "react";
import FullPageContext from "./FullPageContext";

const Cryptomedia = (): JSX.Element => {
  const { post } = useContext(FullPageContext);
  const [videoError, setVideoError] = useState(false);

  return (
    <>
      {post && (
        <div className="flex object-contain justify-center p-2 border-b md:p-8 max-h-75vh text-dark-primary border-dark-border bg-dark-accent md:min-h-33vh">
          {!post.mimeType && !videoError && <p>loading...</p>}
          {post.mimeType.startsWith("video") && !videoError ? (
            <video
              onError={() => setVideoError(true)}
              autoPlay
              muted
              controls
              loop={false}
              playsInline
            >
              <source src={post.contentURI} />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="object-contain max-w-full max-h-full"
              alt={`${post.name}`}
              src={post.contentURI}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Cryptomedia;
