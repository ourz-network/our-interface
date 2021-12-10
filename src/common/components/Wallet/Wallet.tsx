/* eslint-disable no-shadow */
import Link from "next/link"; // Dynamic routing
import { Fragment } from "react"; // State management, Fragment for TailwindUI
import { Popover, Transition } from "@headlessui/react"; // TailwindUI
import { useRouter } from "next/router";
import web3 from "@/app/web3"; // Global state
import Button from "@/components/Button";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Wallet = (): JSX.Element => {
  const { address, network, authenticate, disconnectWeb3 } = web3.useContainer();
  const Router = useRouter();

  // logs user in then checks if they have a profile
  const authenticateWithLoading = async () => {
    await authenticate(); // Authenticate
  };

  // logs user out
  const handleDeactivate = () => {
    disconnectWeb3();
  };

  return address ? ( // If user is authenticated
    <div className="flex justify-center items-center md:justify-end md:flex-1 lg:w-0">
      <Popover className="relative bg-dark-background">
        {() => (
          <>
            <div className="hidden -my-2 -mr-2">
              <Popover.Button className="inline-flex justify-center items-center p-2 text-dark-secondary bg-dark-background hover:text-dark-secondary hover:bg-dark-background focus:outline-none focus:ring-2 focus:ring-inset focus:ring-dark-ourange">
                <span className="sr-only">Open menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Popover.Button>
            </div>
            <Popover.Group as="nav" className="space-x-10 md:flex">
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <Popover.Button
                      className={classNames(
                        open ? "text-dark-primary" : "text-dark-primary",
                        "inline-flex items-center pl-2 mr-6 text-base font-medium group bg-dark-background hover:text-dark-primary focus:outline-none focus:ring-2 focus:ring-ourange-500"
                      )}
                    >
                      <span>
                        {`${address.substr(0, 5)}...${address.slice(address.length - 5)}`}
                      </span>
                      {/* chevron-down */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </Popover.Button>

                    <Transition
                      show={open}
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel
                        static
                        className="absolute z-10 px-2 mt-6 -ml-4 w-screen min-w-min transform max-w-xxs sm:px-0 lg:-ml-2 lg:left-1/12 lg:-translate-x-1/12"
                      >
                        <div className="overflow-hidden border-2 ring-1 ring-opacity-5 shadow-lg border-ourange-500 ring-ourange-500">
                          <div className="grid relative gap-4 p-4 bg-dark-background">
                            <Link href={`/${network?.chainId ?? 1}/profile/${address}`} passHref>
                              <div className="p-2 w-full text-base font-medium text-right cursor-pointer p- hover:bg-dark-background text-dark-primary">
                                Profile
                              </div>
                            </Link>
                            <Link href={`/${network?.chainId ?? 1}/dashboard`} passHref>
                              <div className="p-2 w-full text-base font-medium text-right whitespace-nowrap cursor-pointer p- hover:bg-dark-background text-dark-primary">
                                Manage Splits
                              </div>
                            </Link>
                            <button
                              key="Logout"
                              className="p-2 w-full text-base font-medium text-right cursor-pointer p- hover:bg-dark-background text-dark-primary"
                              onClick={handleDeactivate}
                              type="button"
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </Popover.Group>
          </>
        )}
      </Popover>
      <Button
        text={
          network?.chainId === 1 || network?.chainId === 4 || network?.chainId === 137
            ? `Create`
            : `Wrong Network`
        }
        isMain
        onClick={
          network?.chainId === 1 || network?.chainId === 4 || network?.chainId === 137
            ? () => Router.push(`/${network?.chainId}/create`)
            : () => null
        }
      />
    </div>
  ) : (
    // Else if user is not authenticated
    <div className="justify-end items-center mt-2 md:mt-0 md:flex md:flex-1 lg:w-0">
      <Button text="Connect Wallet" isMain onClick={authenticateWithLoading} />
    </div>
  );
};

export default Wallet;
