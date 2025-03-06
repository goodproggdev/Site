import React, { useEffect, useState } from "react";

const Profile = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/data/") // Chiamata all'API Django
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error("Errore nel fetch:", error));
  }, []);

  if (!data) {
    return <div className="text-center text-lg">Caricamento...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold">{data.presentation} {data.name}</h1>
        <p className="text-lg text-gray-600">{data.header_mono_subtitle}</p>
      </header>
      <div className="flex justify-center gap-4 my-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          {data.print_resume}
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded">
          {data.download_my_cv}
        </button>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        {Object.entries(data.social_links).map(([platform, url]) => (
          <a key={platform} href={url} className="text-blue-600 hover:underline">
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </a>
        ))}
      </div>
      <section className="mt-8">
        <h2 className="text-2xl font-bold">Chi Sono?</h2>
        <p>{data.about.who}</p>
        <p>{data.about.details}</p>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-bold">Skills</h2>
        <ul>
          {data.skills.map((skill, index) => (
            <li key={index}>{skill.name}: {skill.level}</li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-bold">Esperienze Lavorative</h2>
        <ul>
          {data.work_experience_list.map((job, index) => (
            <li key={index} className="mt-2">
              <strong>{job.period}</strong> - {job.title}: {job.subtitle}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Profile;