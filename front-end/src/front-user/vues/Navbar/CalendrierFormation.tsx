import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PDFViewer from './../Viewer/PDFViewer'
import '@react-pdf-viewer/core/lib/styles/index.css'; // Import des styles de react-pdf-viewer

type Session = {
    id_session: number;
    date_debut: string | null;
    date_fin: string | null;
    lieu: string;
    id_formation: number;
    id_formateur: number;
    id_theme: number;
    etat: string;
    type_session: string;
    theme?: string;
    code?: string;
    nom_complet?: string;
    domaine?: string;
    fiche_prg?: string;
};

const CalendrierFormation = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const workerUrl = `${window.location.origin}/js/pdf.worker.min.js`;

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/apiUser/calendrierFormation`);
                
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                setSessions(data);
            } catch (err) {
                console.error("Erreur lors de la récupération des sessions:", err);
                setError("Impossible de charger les données. Veuillez réessayer plus tard.");
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const allMonths = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    const displayedMonths = allMonths.slice(currentMonthIndex, currentMonthIndex + 6);

    const handleMonthNavigation = (direction: 'prev' | 'next') => {
        setCurrentMonthIndex(prev => 
            direction === 'prev' 
                ? Math.max(0, prev - 1) 
                : Math.min(allMonths.length - 6, prev + 1)
        );
    };

    const getMonthFromDate = (dateString: string | null): number => {
        if (!dateString) return -1;
        const date = new Date(dateString);
        return date.getMonth();
    };

    const formatDateRange = (start: string | null, end: string | null): string => {
        if (!start || !end) return "Dates non définies";
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        return `${startDate.getDate()} - ${endDate.getDate()}`;
    };

    const groupSessionsByDomaine = () => {
        const grouped: Record<string, Session[]> = {};
        
        sessions.forEach(session => {
            const domaine = session.domaine || "Autre";
            if (!grouped[domaine]) {
                grouped[domaine] = [];
            }
            grouped[domaine].push(session);
        });
        
        return grouped;
    };

    const handleSessionClick = (session: Session) => {
        setSelectedSession(session);
    };

    const closeModal = () => setSelectedSession(null);

    const downloadPDF = () => {
        const input = document.getElementById("calendrier-table");
        if (!input) return;

        html2canvas(input, { 
            scale: 2,
            logging: false,
            useCORS: true
        }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("l", "mm", "a4");
            const imgWidth = 290;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
            pdf.save("calendrier_formations.pdf");
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-5 pt-20 bg-gray-100 min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erreur ! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 pt-20 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-teal-700 text-center mb-8">Calendrier des Formations</h1>
                
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => handleMonthNavigation('prev')}
                        disabled={currentMonthIndex === 0}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
                    >
                        Mois Précédent
                    </button>
                    <button
                        onClick={() => handleMonthNavigation('next')}
                        disabled={currentMonthIndex + 6 >= allMonths.length}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
                    >
                        Mois Suivant
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <table id="calendrier-table" className="min-w-full">
                        <thead>
                            <tr className="bg-teal-600 text-white">
                                <th className="p-4 text-left">Domaine</th>
                                <th className="p-4 text-left">Thème</th>
                                <th className="p-4 text-left">Type</th>
                                {displayedMonths.map((month, index) => (
                                    <th key={index} className="p-4 text-center">{month}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupSessionsByDomaine()).map(([domaine, sessions]) => (
                                <React.Fragment key={domaine}>
                                    {sessions.map((session, idx) => (
                                        <tr 
                                            key={session.id_session} 
                                            className={`border-t hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                        >
                                            {idx === 0 && (
                                                <td rowSpan={sessions.length} className="p-4 font-semibold align-top  w-20">
                                                    {domaine}
                                                </td>
                                            )}
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => handleSessionClick(session)}
                                                    className="text-teal-600 hover:text-teal-800 hover:underline w-67" 
                                                >
                                                    {session.theme }
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                {session.type_session === "En ligne" ? (
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                        En ligne
                                                    </span>
                                                ) : (
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                                        Présentiel
                                                    </span>
                                                )}
                                            </td>
                                            {displayedMonths.map((_, monthIdx) => {
                                                const monthIndex = currentMonthIndex + monthIdx;
                                                const startMonth = getMonthFromDate(session.date_debut);
                                                const endMonth = getMonthFromDate(session.date_fin);
                                                
                                                const isInMonth = startMonth === monthIndex || 
                                                                endMonth === monthIndex || 
                                                                (startMonth < monthIndex && endMonth > monthIndex);
                                                
                                                return (
                                                    <td key={monthIdx} className="p-4 text-center">
                                                        {isInMonth ? (
                                                            <span className="inline-block px-2 py-1 bg-teal-100 text-teal-800 rounded">
                                                                {formatDateRange(session.date_debut, session.date_fin)}
                                                            </span>
                                                        ) : null}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-center">
                    <button
                        onClick={downloadPDF}
                        className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Télécharger le calendrier
                    </button>
                </div>

                {selectedSession && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-teal-700">Détails de la session</h2>
                                    <button 
                                        onClick={closeModal}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2">Informations générales</h3>
                                        <div className="space-y-2">
                                            <p><span className="font-medium">Thème:</span> {selectedSession.theme }</p>
                                            <p><span className="font-medium">Code:</span> {selectedSession.code }</p>
                                            <p><span className="font-medium">Formateur:</span> {selectedSession.nom_complet }</p>
                                            <p><span className="font-medium">Type:</span> {selectedSession.type_session }</p>
                                            <p><span className="font-medium">Lieu:</span> {selectedSession.lieu }</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2">Dates</h3>
                                        <div className="space-y-2">
                                            <p><span className="font-medium">Début:</span> {selectedSession.date_debut ? new Date(selectedSession.date_debut).toLocaleDateString() : "Non définie"}</p>
                                            <p><span className="font-medium">Fin:</span> {selectedSession.date_fin ? new Date(selectedSession.date_fin).toLocaleDateString() : "Non définie"}</p>
                                            <p><span className="font-medium">État:</span> 
                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                                    selectedSession.etat === "A Réalisé" ? "bg-green-100 text-green-800" :
                                                    selectedSession.etat === "planifiée" ? "bg-blue-100 text-blue-800" :
                                                    "bg-gray-100 text-gray-800"
                                                }`}>
                                                    {selectedSession.etat || "Non spécifié"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {selectedSession.fiche_prg && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold text-gray-700 mb-3">Fiche programme</h3>
                                        <div className="border rounded-lg overflow-hidden" style={{ height: "500px" }}>
                                        <PDFViewer 
      fileUrl={`${import.meta.env.VITE_APP_API_URL}/uploads/${selectedSession.fiche_prg}`} 
    />   </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendrierFormation;