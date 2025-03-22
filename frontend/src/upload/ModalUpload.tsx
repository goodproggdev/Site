import { useState } from "react";
import { Modal, Button, FileInput, Label } from "flowbite-react";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const allowedTypes = ["application/pdf", "application/msword", "text/plain"];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && allowedTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
        } else {
            alert("Formato non supportato! Carica solo PDF, DOC o TXT.");
            setFile(null);
        }
    };

    const handleFileUpload = async () => {
        if (!file) {
            alert("Seleziona un file prima di analizzarlo.");
            return;
        }
    
        const formData = new FormData();
        formData.append("file", file);
    
        try {
            console.log("Inizio caricamento file:", file.name); // Debug
            console.log(formData.get("file"));
    
            //'http://127.0.0.1:8000/auth/login/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:loginEmail,password:loginPassword})})

            const response = await fetch("http://127.0.0.1:8000/upload/", { //Assicurati che l'url sia corretto
                method: "POST",
                body: formData,
            });
    
            console.log("Risposta dal server:", response); // Debug
    
            if (response.ok) {
                const data = await response.json();
                console.log("Dati ricevuti:", data); // Debug
                alert(data.message);
                onClose();
            } else {
                console.error("Errore durante il caricamento:", response.status, response.statusText); // Debug
                alert("Errore durante il caricamento del file.");
            }
        } catch (error) {
            console.error("Errore di rete:", error); // Debug
            alert("Errore durante il caricamento del file.");
        }
    };

    return (
        <Modal show={isOpen} onClose={onClose}>
            <Modal.Header>Carica un file</Modal.Header>
            <Modal.Body>
                <div className="flex w-full items-center justify-center">
                    <Label
                        htmlFor="dropzone-file"
                        className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                    >
                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                            <svg
                                className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 16"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click per caricare</span> o trascina un file
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF, DOC o TXT (Max 800x400px)
                            </p>
                        </div>
                        <FileInput
                            id="dropzone-file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.txt"
                        />
                    </Label>
                </div>
                {file && (
                    <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                        File selezionato: {file.name}
                    </p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onClose} color="gray">
                    Chiudi
                </Button>
                <Button onClick={handleFileUpload}>Analizza</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UploadModal;