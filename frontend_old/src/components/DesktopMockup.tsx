import React from "react";

const DesktopMockup: React.FC = () => {
  return (
<figure className="ms-auto me-20 relative z-[1] max-w-full w-[50rem] h-auto shadow-[0_2.75rem_3.5rem_-2rem_rgb(45_55_75_/_20%),_0_0_5rem_-2rem_rgb(45_55_75_/_15%)] dark:shadow-[0_2.75rem_3.5rem_-2rem_rgb(0_0_0_/_20%),_0_0_5rem_-2rem_rgb(0_0_0_/_15%)] rounded-b-lg">
  <div className="relative flex items-center max-w-[50rem] bg-gray-800 rounded-t-lg py-2 px-24 dark:bg-neutral-700">
    <div className="flex gap-x-1 absolute top-2/4 start-4 -translate-y-1">
      <span className="size-2 bg-gray-600 rounded-full dark:bg-neutral-600"></span>
      <span className="size-2 bg-gray-600 rounded-full dark:bg-neutral-600"></span>
      <span className="size-2 bg-gray-600 rounded-full dark:bg-neutral-600"></span>
    </div>
    <div className="flex justify-center items-center size-full bg-gray-700 text-[.25rem] text-gray-400 rounded-sm sm:text-[.5rem] dark:bg-neutral-600 dark:text-neutral-400">www.preline.com</div>
  </div>

  <div className="bg-gray-800 rounded-b-lg">
    <img className="h-auto w-full dark:hidden object-contain rounded-b-lg" src="https://flowbite.s3.amazonaws.com/docs/device-mockups/screen-image-imac.png" alt="Mobile Placeholder" />
    <img className="h-auto w-full dark:block object-contain rounded-b-lg" src="https://flowbite.s3.amazonaws.com/docs/device-mockups/screen-image-imac-dark.png" alt="Mobile Placeholder" />
  </div>
</figure>
  );
};


export default DesktopMockup;
