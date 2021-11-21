import web3 from "@/app/web3";

export default function GlobalProvider({ children }: { children: JSX.Element }): JSX.Element {
  return <web3.Provider>{children}</web3.Provider>;
}

export { web3 };
