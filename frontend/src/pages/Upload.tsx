import { useState } from "react";
import { Button } from "flowbite-react";
import UploadModal from "../upload/ModalUpload";

const Home = () => {
    const [openModal, setOpenModal] = useState(false);

    return (
        <section className="bg-white dark:bg-gray-900">
            <div className="max-w-screen-xl px-4 py-8 mx-auto text-center lg:py-16 lg:px-6">
                <Button onClick={() => setOpenModal(true)}>Apri Upload</Button>
                <UploadModal isOpen={openModal} onClose={() => setOpenModal(false)} />
            </div>
        </section>
    );
};

export default Home;
