import { useState, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthAdmin';

const Settings = () => {
  const { user, setUser } = useAuth(); // Utiliser le hook useAuth pour récupérer l'utilisateur et l'état de connexion

  // Initialisation des champs avec les données de l'utilisateur si elles existent
  const [phoneNumber, setPhoneNumber] = useState(user?.telephone || '');
  const [email, setEmail] = useState(user?.email_admin || '');
  const [poste, setPoste] = useState(user?.poste || '');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Synchronisation des champs si les données utilisateur changent
    if (user) {
      setPhoneNumber(user.telephone || '');
      setEmail(user.email_admin || '');
      setPoste(user.poste || '');
    }
  }, [user]);

  const handleConfirm = () => {
    if (!user?.id_admin) {
      console.error("ID de l'administrateur non disponible");
      return;
    }

    const updatedInfo = {
      ...user,
      telephone: phoneNumber,
      email_admin: email,
      poste,
      ...(password && { password }), // N'inclure le mot de passe que s'il est non vide
    };

    // Appel API pour mettre à jour l'utilisateur
    axios
      .put(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/admin/${user.id_admin}`, updatedInfo, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (response.data) {
          setUser(updatedInfo);
          console.log('Réponse de l\'API:', response.data);
          navigate('/Admin/profile');
        } else {
          console.error('La réponse est vide ou mal formée');
        }
      })
      .catch((error) => {
        console.error('Erreur de connexion au serveur', error);
      });
  };

  const handleCancel = () => {
    // Réinitialisation des champs avec les valeurs du contexte utilisateur
    setPhoneNumber('');
    setEmail('');
    setPoste('');
    setPassword('');
  };

  return (
    <>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="paramétre" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Information Personnelle
                </h3>
              </div>
              <div className="p-7">
                <form action="#">
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="fullName"
                    >
                      Nom Complet
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black  dark:bg-meta-4 dark:border-strokedark dark:text-white dark:focus:border-primary"
                      type="text"
                      name="fullName"
                      id="fullName"
                      placeholder="Devid Jhon"
                      value={user?.nom_admin || ''} // Nom complet est affiché mais non modifiable
                      readOnly
                    />
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="phoneNumber"
                    >
                      Phone Number
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="phoneNumber"
                      id="phoneNumber"
                      placeholder="+216"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="emailAddress"
                    >
                      Adresse Email
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="email"
                      name="emailAddress"
                      id="emailAddress"
                      placeholder="@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="poste"
                    >
                      Poste
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="poste"
                      id="poste"
                      placeholder="Poste de l'utilisateur"
                      value={poste}
                      onChange={(e) => setPoste(e.target.value)}
                    />
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="password"
                    >
                      Nouveau Mot de Passe
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="password"
                      name="password"
                      id="password"
                      placeholder="Entrer le nouveau mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
                      onClick={handleCancel}
                    >
                      Annuler
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                      type="button"
                      onClick={handleConfirm}
                    >
                      Confirmer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
