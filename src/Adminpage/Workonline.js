import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Button, Modal } from 'react-bootstrap';
import { FaCalendarAlt, FaTimesCircle, FaCheckCircle, FaPlayCircle } from 'react-icons/fa';
import Swal from 'sweetalert2'; // Import SweetAlert
import './Conge.css';
const WorkOnline = () => {
    const [workOnlineRequests, setWorkOnlineRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [requestsPerPage] = useState(5);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        fetchWorkOnlineRequests();
    }, []);

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
    };
    const handleDateFilter = (date) => {
        setSelectedDate(date);
    };

    const fetchWorkOnlineRequests = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.get(`${API_BASE_URL}/api/admin/allonlinework`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            setWorkOnlineRequests(response.data.workonline);
        } catch (error) {
            console.error('Error fetching work online requests:', error);
        }
    };

    const handleUpdate = async (status, request) => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.put(`${API_BASE_URL}/api/admin/updateonline/${request.id}`, {
                status: status,
            }, {
                headers: {
                  Authorization: `Bearer ${authToken}`
                }
              });
            if (response.status === 200) {
                let successMessage = 'Work mode change request updated successfully';
                if (status === 'refused') {
                    successMessage = 'Work mode change request refused successfully';
                }
                Swal.fire('Success', successMessage, 'success');
                setShowUpdateModal(false);
                fetchWorkOnlineRequests();
            }
        } catch (error) {
            console.error('Error updating work online request:', error);
            Swal.fire('Error', 'Failed to update work mode change request', 'error');
        }
    };

    const handleShowUpdateModal = (request) => {
        setSelectedRequest(request);
        setShowUpdateModal(true);
    };

    const indexOfLastRequest = currentPage * requestsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;

    const filteredWorkonline = () => {
        let filteredRequests = [...workOnlineRequests];
    
        if (statusFilter !== 'all') {
            filteredRequests = filteredRequests.filter(item => item.status === statusFilter);
        }
    
        if (selectedDate) {
            filteredRequests = filteredRequests.filter(item => item.date === selectedDate);
        }
    
        return filteredRequests;
    };
    const currentRequests = filteredWorkonline().slice(indexOfFirstRequest, indexOfLastRequest);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <h2 style={{marginTop:'150px',position:'relative'}}>Les Demandes De Travailler en ligne</h2>
            <div className="filter-buttons">
            <select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)}>
              <option value="all">Tous les demandes</option>
              <option value="accepted">Demandes acceptées</option>
              <option value="refused">Demandes refusées</option>
              <option value="en_cours">Demandes en cours</option>
            </select>
          </div>
          

            <div style={{ marginTop: '20px', overflowY: 'auto', maxHeight: '400px' }}>
    <table className="usetab" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
            <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>#</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>CIN</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Prénom</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Nom</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>
                <input 
    type="date" 
    value={selectedDate} 
    onChange={(e) => {
        if (e.target.value === selectedDate) {
            setSelectedDate('');
        } else {
            setSelectedDate(e.target.value);
        }
        handleDateFilter(e.target.value);
    }} 
    style={{ width: '150px', height: '30px', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }} 
/>
</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black', width: '400px' }}>Description</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Status</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Action</th>
            </tr>
        </thead>
        <tbody>
            {currentRequests.slice(0).reverse().map((request, index) => (
                <tr key={request.id} style={{ backgroundColor: (index + 1) % 4 === 2 || (index + 1) % 4 === 0 ? '#f2f2f2' : 'white' }}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{indexOfFirstRequest + index + 1}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{request.user ? request.user.cin:''}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{request.user ? request.user.firstname : 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{request.user ? request.user.lastname : ''}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        {/* Button with icon for Date */}
                        <button style={{ backgroundColor: '#F1F1F2', color: 'black', padding: '5px', borderRadius: '15px', fontSize: '15px' }}>
                            <FaCalendarAlt style={{ marginRight: '5px', marginTop: '-2px' }} />
                            {request.date}
                        </button>
                    </td>
                    <td style={{ border: '1px solid #ddd'}}>
                        <textarea 
                            style={{ width: '100%', height: '50px', padding: '5px', resize: 'none' }} 
                            value={request.reason} 
                            readOnly 
                        />
                    </td>

                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        {/* Button with icon for Status */}
                        {request.status === 'refused' ? (
                            <button style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px', borderRadius: '15px', fontSize: '15px' }}>
                                <FaTimesCircle style={{ marginRight: '5px', marginTop: '-2px' }} />
                                {request.status}
                            </button>
                        ) : request.status === 'accepted' ? (
                            <button style={{ backgroundColor: '#3498db', color: 'white', padding: '5px', borderRadius: '15px', fontSize: '15px' }}>
                                <FaCheckCircle style={{ marginRight: '5px', marginTop: '-2px' }} />
                                {request.status}
                            </button>
                        ) : (
                            <button style={{ backgroundColor: 'orange', color: 'white', padding: '5px', borderRadius: '15px', fontSize: '15px' }}>
                                <FaPlayCircle style={{ marginRight: '5px', marginTop: '-2px' }} />
                                {request.status}
                            </button>
                        )}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        {request.status === 'refused' ? (
                            <Button variant="danger">Refuser</Button>
                        ) : request.status === 'accepted' ? (
                            <button className="btn btn-view-reasons">Acceptée</button>
                        ) : (
                            <div className="button-container">
                                <button className="btn btn-accept" onClick={() => handleUpdate('accepted', request)}>Accepter</button>
                                <button className="btn btn-refuse" onClick={() => handleUpdate('refused', request)}>Refuser</button>
                            </div>
                        )}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>

            {/* Update Modal */}
            <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Work Mode Change Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to update the status of this request?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => handleUpdate('refused', selectedRequest)}>
                        Refuse
                    </Button>
                    <Button variant="primary" onClick={() => handleUpdate('accepted', selectedRequest)}>
                        Accept
                    </Button>
                    <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className="pagination">
                {Array.from({ length: Math.ceil(filteredWorkonline().length / requestsPerPage) }, (_, i) => (
                    <button key={i + 1} onClick={() => paginate(i + 1)} style={{ backgroundColor: currentPage === i + 1 ? 'lightblue' : 'white' }}>
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WorkOnline;
