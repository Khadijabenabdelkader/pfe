import React, { useEffect, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import CoverOne from '../images/cover/cover-01.png';
import user from '../images/user/user_1.png';
import { useAuth } from '../hooks/useAuthAdmin';

const Profile = () => {
  const { user,setUser, isLoggedIn, loading } = useAuth(); // Utiliser le hook useAuth pour récupérer l'utilisateur et l'état de connexion
  const location = useLocation();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    console.log(userInfo); // Ajouter un log pour voir les données récupérées
    if (userInfo.nom_admin && userInfo.role) {
      setUser({ nom: userInfo.nom_admin, role: userInfo.role, description: userInfo.description, phone: userInfo.phone, email: userInfo.email });
    }
  }, [location, setUser]);

  return (
    <>
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="relative z-20 h-35 md:h-65">
          <img
            src={CoverOne}
            alt="profile cover"
            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
          />
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <label
              htmlFor="cover"
              className="flex cursor-pointer items-center justify-center gap-2 rounded bg-primary py-1 px-2 text-sm font-medium text-white hover:bg-opacity-90 xsm:px-4"
            >
              <input type="file" name="cover" id="cover" className="dark:border-strokedark dark:text-white sr-only" />
              <span>Edit</span>
            </label>
          </div>
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className=" relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
            <div className="relative drop-shadow-2">
              <img src={user} alt="" />
              <label
                htmlFor="profile"
                className="absolute bottom-0 right-0 flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
              >
                <input
                  type="file"
                  name="profile"
                  id="profile"
                  className="dark:border-strokedark dark:text-white sr-only"
                />
              </label>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="dark:border-strokedark dark:text-white mb-1.5 text-2xl font-semibold text-black dark:text-white">
              {user.nom_admin}
            </h3>
            <p className="font-medium">{user.role}</p>

            </div>
        </div>
        <div className='px-5'>
            <h3 className='dark:border-strokedark dark:text-white underline text-gray-800'>E_mail:</h3>
            <p className="dark:border-strokedark dark:text-white mt-2 text-lg text-gray-600 dark:text-gray-400">{user.email_admin}</p>
            <h3 className='dark:border-strokedark dark:text-white underline text-gray-800'>Téléphone</h3>
            <p className="dark:border-strokedark dark:text-white mt-2 text-lg text-gray-600 dark:text-gray-400">{user.telephone}</p>
            <h3 className='dark:border-strokedark dark:text-white underline text-gray-800'>description: </h3>
            <p className="dark:border-strokedark dark:text-white mt-2 text-lg text-gray-600 dark:text-gray-400">{user.description}</p>
            
      </div>
      </div>
      
    </>
  );
};

export default Profile;
