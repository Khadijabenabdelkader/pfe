import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { useAuth } from '../hooks/useAuthAdmin';
import { FiEdit, FiMail, FiPhone, FiBriefcase } from 'react-icons/fi';
import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

type ProfilePicture = {
  id: string;
  url: string;
  alt: string;
};

const defaultProfilePictures: ProfilePicture[] = [
  { id: '1', url: '/profileFc.jpg', alt: 'Avatar 1' },
  { id: '2', url: '/pro.jpg', alt: 'Avatar 2' },
  { id: '3', url: '/proH.jpg', alt: 'Avatar 3' },
  { id: '4', url: '/profileFh.jpg', alt: 'Avatar 4' },
  { id: '5', url: '/me.jpg', alt: 'Avatar 5' },
];

const Profile = () => {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedImage, setSelectedImage] = useState(user.avatar || defaultProfilePictures[0].url);

  useEffect(() => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  if (userData.nom_admin) {
    setUser({ 
      ...userData,
      avatar: userData.avatar || defaultProfilePictures[0].url
    });
    setSelectedImage(userData.avatar || defaultProfilePictures[0].url);
  }
}, [location, setUser]);

const handleImageSelect = (imageUrl: string) => {
  // Mettre à jour l'état local
  setSelectedImage(imageUrl);
  
  // Mettre à jour le contexte global
  const updatedUser = { ...user, avatar: imageUrl };
  setUser(updatedUser);

  // Mettre à jour le localStorage
  const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
  const updatedUserData = {
    ...existingUser,
    avatar: imageUrl
  };
  localStorage.setItem('user', JSON.stringify(updatedUserData));
  
  setShowImageSelector(false);
};

  return (
    <>
      <Breadcrumb pageName="Mon Profil" />

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
              <img 
                src={selectedImage} 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
              <button 
                onClick={() => setShowImageSelector(true)}
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-all"
              >
                <FiEdit className="text-sm" />
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.nom_admin}
            </h2>
            <p className="text-teal-500 font-medium">{user.role}</p>
          </div>
        </div>

        {showImageSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Choisir une image de profil</h3>
                <button 
                  onClick={() => setShowImageSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IonIcon icon={closeOutline} className="text-xl" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {defaultProfilePictures.map((picture) => (
                  <div 
                    key={picture.id} 
                    className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                      selectedImage === picture.url ? 'border-teal-500' : 'border-transparent'
                    }`}
                    onClick={() => handleImageSelect(picture.url)}
                  >
                    <img 
                      src={picture.url} 
                      alt={picture.alt} 
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowImageSelector(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-500">
              <FiMail className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
              <p className="text-gray-800 dark:text-gray-200 mt-1">{user.email_admin || 'Non spécifié'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-500">
              <FiPhone className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</h3>
              <p className="text-gray-800 dark:text-gray-200 mt-1">{user.telephone || 'Non spécifié'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-500">
              <FiBriefcase className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Poste</h3>
              <p className="text-gray-800 dark:text-gray-200 mt-1">{user.poste || 'Non spécifié'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;