import React, { useState, useEffect } from 'react';
import { api } from '../../../api/api';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUserGroup, HiOutlineCalendar, HiOutlineClipboardCheck, HiOutlineChatAlt2, HiOutlineBadgeCheck, HiOutlineXCircle } from 'react-icons/hi';
import './TrackingScreening.css';

const STAGES = [
    { id: 'New Applicant', title: 'New Applicant', icon: <HiOutlineUserGroup />, colorClass: 'column-new' },
    { id: 'Document Review', title: 'Doc Review', icon: <HiOutlineClipboardCheck />, colorClass: 'column-doc' },
    { id: 'Initial Screening', title: 'Initial Screening', icon: <HiOutlineChatAlt2 />, colorClass: 'column-initial' },
    { id: 'Technical Interview', title: 'Technical', icon: <HiOutlineClipboardCheck />, colorClass: 'column-technical' },
    { id: 'Final Interview', title: 'Final Interview', icon: <HiOutlineChatAlt2 />, colorClass: 'column-final' },
    { id: 'Accepted', title: 'Accepted', icon: <HiOutlineBadgeCheck />, colorClass: 'column-accepted' },
    { id: 'Rejected', title: 'Rejected', icon: <HiOutlineXCircle />, colorClass: 'column-rejected' }
];

function TrackingScreening() {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchApplicants = async () => {
        try {
            const response = await api.get('users/get_applicant_info/');
            setApplicants(response.data);
        } catch (err) {
            console.error("Error fetching applicants for pipeline:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
        const interval = setInterval(fetchApplicants, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const getApplicantsByStage = (stageId) => {
        return applicants.filter(applicant => applicant.status === stageId);
    };

    const getCardClass = (stageId) => {
        switch (stageId) {
            case 'New Applicant': return 'card-new';
            case 'Document Review': return 'card-doc';
            case 'Initial Screening': return 'card-initial';
            case 'Technical Interview': return 'card-technical';
            case 'Final Interview': return 'card-final';
            case 'Accepted': return 'card-accepted';
            case 'Rejected': return 'card-rejected';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="tracking-screening-container">
            <div className="tracking-screening-header">
                <h2>Tracking & Screening</h2>
                <p>Monitor and manage applicants through each stage of the recruitment process.</p>
            </div>

            <div className="pipeline-board">
                {STAGES.map(stage => {
                    const stageApplicants = getApplicantsByStage(stage.id);
                    return (
                        <div key={stage.id} className={`pipeline-column ${stage.colorClass}`}>
                            <div className="column-header">
                                <h3 className="column-title">
                                    {stage.icon}
                                    {stage.title}
                                </h3>
                                <span className="applicant-count">{stageApplicants.length}</span>
                            </div>
                            <div className="applicant-list">
                                {stageApplicants.length > 0 ? (
                                    stageApplicants.map(applicant => (
                                        <div 
                                            key={applicant.id} 
                                            className={`applicant-card ${getCardClass(stage.id)}`}
                                            onClick={() => navigate(`../view-details/${applicant.id}`)}
                                        >
                                            <h4>{applicant.firstname} {applicant.lastname}</h4>
                                            <span className="program">{applicant.program}</span>
                                            <div className="date">
                                                <HiOutlineCalendar />
                                                {new Date(applicant.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-xs italic">
                                        No applicants here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TrackingScreening;
