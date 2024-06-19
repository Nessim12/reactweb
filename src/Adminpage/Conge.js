import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaPlayCircle } from 'react-icons/fa';
import Motif from './Motif';
import './Conge.css';
import Holiday from './Holiday';

const Conge = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refuseReason, setRefuseReason] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [viewReasonModalIsOpen, setViewReasonModalIsOpen] = useState(false);
  const [selectedDemandeId, setSelectedDemandeId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSelect, setShowSelect] = useState(false);

  const fetchDemandes = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/alldemande`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setDemandes(response.data.demandes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching demandes:', error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const filteredDemandes = () => {
    if (statusFilter === 'all') {
      return demandes;
    } else {
      return demandes.filter(demande => demande.status === statusFilter);
    }
  };

  const handleAcceptDemande = async (id) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      await axios.put(`${API_BASE_URL}/api/admin/updatedemande/${id}`, { status: 'accepter' }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      await fetchDemandes(); // Refresh demands after accepting
      Swal.fire({
        title: 'Demande Accepted',
        text: 'The demande has been accepted.',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500
      });
      // Update pagination
      setCurrentPage(1);
    } catch (error) {
      console.error('Error accepting demande:', error.message);
    }
  };

  const handleRefuseDemande = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken || !selectedDemandeId) {
        throw new Error('Authentication token not found or invalid demande id');
      }

      await axios.put(`${API_BASE_URL}/api/admin/updatedemande/${selectedDemandeId}`, { status: 'refuser', refuse_reason: refuseReason }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      await fetchDemandes(); // Refresh demands after refusing
      setModalIsOpen(false); // Close the refusal reason modal
      setRefuseReason(''); // Clear refuse reason
      // Update pagination
      setCurrentPage(1);
    } catch (error) {
      console.error('Error refusing demande:', error.message);
    }
  };

  const openRefuserModal = (id) => {
    setSelectedDemandeId(id);
    setModalIsOpen(true);
  };

  const openViewReasonModal = (reason) => {
    setRefuseReason(reason);
    setViewReasonModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setRefuseReason('');
  };

  const closeViewReasonModal = () => {
    setViewReasonModalIsOpen(false);
    setRefuseReason('');
  };


  // Logic for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentDemandes = filteredDemandes().slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="conge-container">
 
      {/* Add the Motif component here */}
      {loading ? (
        <div>Chargement en cours...</div>
      ) : (
        <div>
          <h2 style={{marginTop:'250px',position:'relative'}}>Les Demandes de Congé</h2>
          <div className="filter-buttons">
            <select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)}>
              <option value="all">Tous les demandes</option>
              <option value="accepter">Demandes acceptées</option>
              <option value="refuser">Demandes refusées</option>
              <option value="en_cours">Demandes en cours</option>
            </select>
          </div>
          <div style={{ marginTop: '20px', overflowY: 'auto', maxHeight: '400px' }}>
            <table className="usetab" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>#</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>CIN</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Utilisateur</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Solde Congé</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Date Début</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Date Fin</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Motif</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Description</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Solde Demandée</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Status</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Reverse the order of currentDemandes and map */}
                {currentDemandes.slice(0).reverse().map((demande, index) => (
                  <tr key={demande.id} style={{ backgroundColor: (index + 1) % 4 === 2 || (index + 1) % 4 === 0 ? '#f2f2f2' : 'white' }} >
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{indexOfFirstUser + index + 1}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{demande.user ? `${demande.user.cin}` : ''}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{demande.user ? `${demande.user.firstname} ${demande.user.lastname}` : ''}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{demande.user ? `${demande.user.soldecongée}` : ''}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {/* Button with icon for Date Début */}
                      <button style={{ backgroundColor: '#F1F1F2', color: 'black', padding: '5px', borderRadius: '15px', fontSize: '15px' }}>
                        <FaCalendarAlt style={{ marginRight: '5px', marginTop: '-2px' }} />
                        {demande.date_d}
                      </button>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {/* Button with icon for Date Fin */}
                      <button style={{ backgroundColor: '#A1D6E2', color: 'black', padding: '5px', borderRadius: '15px', fontSize: '15px' }}>
                        <FaCalendarAlt style={{ marginRight: '5px', marginTop: '-2px' }} />
                        {demande.date_f}
                      </button>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{demande.motif ? demande.motif.motif_name : ''}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{demande.description}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{demande.solde}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {/* Button with icon for Statut */}
                      {demande.status === 'refuser' ? (
                        <button style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px', borderRadius: '15px', fontSize: '15px' }}>
                          <FaTimesCircle style={{ marginRight: '5px', marginTop: '-2px' }} />
                          {demande.status}
                        </button>
                      ) : demande.status === 'en_cours' ? (
                        <button style={{ backgroundColor: 'orange', color: 'white', padding: '5px', borderRadius: '15px', fontSize: '15px' }}>
                          <FaPlayCircle style={{ marginRight: '5px', marginTop: '-2px' }} />
                          {/* You can change the icon here based on your preference */}
                          {demande.status}
                        </button>
                      ) : (
                        <button style={{ backgroundColor: '#3498db', color: 'white', padding: '5px', borderRadius: '15px', fontSize: '15px' }}>
                          <FaCheckCircle style={{ marginRight: '5px', marginTop: '-2px' }} />
                          {demande.status}
                        </button>
                      )}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {demande.status === 'refuser' ? (
                        <button className="btn btn-view-reason" onClick={() => openViewReasonModal(demande.refuse_reason)}>Voir la raison</button>
                      ) : demande.status === 'accepter' ? (
                        <span ></span>
                      ) : (
                        <div className="button-container">
                          <button className="btn btn-accept" onClick={() => handleAcceptDemande(demande.id)}>Accepter</button>
                          <button className="btn btn-refuse" onClick={() => openRefuserModal(demande.id)}>Refuser</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            {Array.from({ length: Math.ceil(filteredDemandes().length / usersPerPage) }, (_, i) => (
              <button key={i + 1} onClick={() => paginate(i + 1)} style={{ backgroundColor: currentPage === i + 1 ? 'lightblue' : 'white' }}>
                {i + 1}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '70px', marginLeft: '50px', marginRight: '50px' }}>
  <div>
    <Motif />
  </div>
  <div>
    <Holiday />
  </div>
</div>



      

        </div>
        
      )}
      {/* Modal for entering refuse reason */}
      <Modal show={modalIsOpen} onHide={closeModal}>
        <Modal.Header closeButton style={{ backgroundColor: '#90AFC5', color: 'white', borderBottom: 'none' }}>
          <Modal.Title>Refuser la demande</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="refuseReason">
            <Form.Label>Entrez la raison du refus :</Form.Label>
            <Form.Control as="textarea" value={refuseReason} onChange={(e) => setRefuseReason(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleRefuseDemande}>
            Confirmer le refus
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for viewing refusal reason */}
      <Modal show={viewReasonModalIsOpen} onHide={closeViewReasonModal}>
        <Modal.Header closeButton style={{ backgroundColor: '#90AFC5', color: 'white', borderBottom: 'none' }}>
          <Modal.Title>Raison du refus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{refuseReason}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeViewReasonModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    
    </div>
  );
};

export default Conge;
