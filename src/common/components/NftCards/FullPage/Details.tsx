import { useContext } from "react";
import FullPageContext from "./FullPageContext";
import Button from "@/components/Button";

const Details = ({ purchase }): JSX.Element => {
  const { post, saleInfo } = useContext(FullPageContext);

  return (
    <>
      <div className="flex flex-col justify-between">
        <div className="flex justify-between mb-2 h-full">
          <p className="my-auto text-xl tracking-wider lg:text-4xl font-hero text-dark-primary">{`${post?.name}`}</p>
          {post?.symbol && (
            <p className="my-auto text-lg italic text-dark-primary">{`(${post.symbol})`}</p>
          )}
        </div>
        <p className="whitespace-pre-wrap break-normal text-dark-primary">{`${post?.description}`}</p>
      </div>
      {saleInfo !== undefined && (
        <>
          <div className="flex justify-center mt-4 w-full h-auto border border-dark-border">
            <div className="p-1 m-2 text-center">
              <p className="mb-1">
                {saleInfo?.maxSupply > 0
                  ? `Max Supply: ${saleInfo?.maxSupply}`
                  : `${saleInfo?.currentSupply}/∞`}
                <br />
                Minted
              </p>

              {saleInfo?.salePrice > 0 && saleInfo?.maxSupply !== saleInfo?.currentSupply && (
                <div className="w-min">
                  <Button
                    onClick={() => purchase()}
                    text={`Purchase for ${saleInfo?.salePrice}Ξ`}
                    isMain={false}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Details;
