import { useContext } from "react";
import FullPageContext from "./FullPageContext";

const Royalties = (): JSX.Element => {
  const { post } = useContext(FullPageContext);

  return (
    <div className="flex flex-col p-4 my-2 text-center border border-dark-border">
      <p className="mb-4 text-sm tracking-wide">EIP-2981 Creator Royalty:</p>
      <p className="text-2xl font-semibold font-hero">{`${post?.royalty}%`}</p>
    </div>
  );
};

export default Royalties;
