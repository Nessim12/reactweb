import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { FaUsers } from 'react-icons/fa';
import { Button, Modal } from 'react-bootstrap';
import './Dashboard.css';
import { FaDesktop, FaBuilding  } from 'react-icons/fa';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { FaToggleOff,FaToggleOn } from "react-icons/fa6";
import { FaClock } from 'react-icons/fa';
import { LuTimerOff } from 'react-icons/lu';
import Chart from 'chart.js/auto';
import { Doughnut } from 'react-chartjs-2';
import { FaRegClipboard } from "react-icons/fa6";
import { FaInfoCircle } from 'react-icons/fa';
const Dashboard = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [allUsersData, setAllUsersData] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [presentUserCount, setPresentUserCount] = useState(0);
  const [usersNotPresentCount, setUsersNotPresentCount] = useState(0);
  const [percentagePresent, setPercentagePresent] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPointings, setUserPointings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [chartData, setChartData] = useState(null);

  const fetchData = useCallback(async (date) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const apiUrl = `${API_BASE_URL}/api/admin/alluseretatwithdate`;
      const response = await axios.post(apiUrl, { date }, { headers: { Authorization: `Bearer ${authToken}` } });
      setAllUsersData(response.data.user_statuses);

      const userCountResponse = await axios.get(`${API_BASE_URL}/api/admin/countUsers`, { headers: { Authorization: `Bearer ${authToken}` } });
      setUserCount(userCountResponse.data.usercount);

      const presentUserCountResponse = await axios.get(`${API_BASE_URL}/api/admin/alluserpresent`, { headers: { Authorization: `Bearer ${authToken}` } });
      setPresentUserCount(presentUserCountResponse.data.present_users_count);

      const percentage = userCountResponse.data.usercount > 0 ? (presentUserCountResponse.data.present_users_count / userCountResponse.data.usercount) * 100 : 0;
      setPercentagePresent(percentage);

      const notPresentCount = userCountResponse.data.usercount - presentUserCountResponse.data.present_users_count;
      setUsersNotPresentCount(notPresentCount);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, []);

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const filteredUsers = () => {
    if (statusFilter === 'all') {
      return allUsersData;
    } else if (statusFilter === 'accepter') {
      return allUsersData.filter(user => user.status === 'present');
    } else if (statusFilter === 'refuser') {
      return allUsersData.filter(user => user.status !== 'present');
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const handlepointageClick = async (user) => {
    setSelectedUser(user);
    setShowModal(true);

    try {
      await fetchUserPointings(user.user_id);
    } catch (error) {
      console.error('Failed to fetch user pointings:', error);
    }
  };

  const fetchUserPointings = async (userId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/alluserpointage`,
        { date: selectedDate, userId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const userPointings = response.data.user_pointings.find(pointing => pointing.user_id === userId);
      setUserPointings(userPointings || []);
    } catch (error) {
      console.error('Failed to fetch user pointings:', error);
      setUserPointings([]);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const renderAvailabilityIcon = (availability) => {
    return availability === 'available' ?
      <FaToggleOn style={{ color: 'green', fontSize: '30px', animation: 'pulse 1s infinite' }} /> :
      <FaToggleOff style={{ color: 'red', fontSize: '30px' }} />;
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers().slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const prepareChartData = useCallback(() => {
    const data = {
      labels: ['Present Users', 'Absent Users'],
      datasets: [{
        label: 'User Status',
        data: [presentUserCount, usersNotPresentCount],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderWidth: 1,
      }],
    };
    setChartData(data);
  }, [presentUserCount, usersNotPresentCount]);

  useEffect(() => {
    fetchData(selectedDate);
    prepareChartData();
  }, [selectedDate, fetchData, prepareChartData]);

  return (
    <div>
      <div className="statique">
        <div className="chartContainer">
          {chartData && (
            <Doughnut
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      fontSize: 10,
                      usePointStyle: true,
                      generateLabels: function (chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                          return data.labels.map((label, index) => {
                            const value = data.datasets[0].data[index];
                            const percentage = (value / data.datasets[0].data.reduce((a, b) => a + b) * 100).toFixed(2);
                            return {
                              text: `${label}: ${percentage}%`,
                              fillStyle: data.datasets[0].backgroundColor[index],
                              hidden: data.datasets[0].hidden ? data.datasets[0].hidden[index] : false,
                              index: index
                            };
                          });
                        }
                        return [];
                      }
                    }
                  }
                }
              }}
            />

          )}

        </div>
      </div>
      <div className="tablepointage" style={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
  <label htmlFor="datePicker" style={{ marginRight: '10px' }}>Sélectionnez la date :</label>
  <input className="date" type="date" id="datePicker" value={selectedDate} onChange={handleDateChange} />
  <div className="filter-buttons" style={{ marginLeft: 'auto',paddingRight:'200px' ,paddingTop:'10px' }}>
    <select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)}>
      <option value="all">Tous les Utilisateurs</option>
      <option value="accepter">Les Utilisateurs Présents</option>
      <option value="refuser">Les Utilisateurs Absents</option>
    </select>
  </div>
</div>

  
      <div style={{ marginTop: '20px', overflowY: 'auto', maxHeight: '400px',marginBottom:'30px' }}>
      <table className="usetab" style={{ borderCollapse: 'collapse', width: '100%' }}>
  <thead>
    <tr>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>#</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Cin</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Prénom</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Nom de famille</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black', width: '300px' }}>email</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Téléphone</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Work_mod</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Statut</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Disponibilité</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Heures travaillées</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Action</th>
    </tr>
  </thead>
  <tbody>
    {currentUsers.map((user, index) => (
      <tr key={user.user_id} style={{ backgroundColor: (index + 1) % 4 === 2 || (index + 1) % 4 === 0 ? '#f2f2f2' : 'white' }} >
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{indexOfFirstUser + index + 1}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.cin}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.firstname}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.lastname}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px'}}>{user.email}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.tel}</td>
       
<td style={{ border: '1px solid #ddd', padding: '8px' }}>
  {user.work_mod === 'presentiel' ? (
    <>
      <button style={{ backgroundColor: '#e67e22', color: 'white', padding: '3px', borderRadius: '15px', fontSize: '15px' }}>
        <FaBuilding style={{ marginRight: '5px' ,marginTop:'-2px'}} />
        Presentiel
      </button>
    </>
  ) : (
    <>
      <button style={{ backgroundColor: '#2ecc71', color: 'white', padding: '5px 15px', borderRadius: '18px', fontSize: '15px' }}>
        <FaDesktop style={{ marginRight: '5px',marginTop:'-2px' }} />
        Online
      </button>
    </>
  )}
</td>
<td style={{ border: '1px solid #ddd', padding: '8px'}}>
  {user.status === 'present' ? (
    <button style={{ backgroundColor: '#3498db', color: 'white', padding: '5px', borderRadius: '15px', fontSize: '15px' }}>
      <FaCheckCircle style={{ marginRight: '5px',marginTop:'-2px' }} />
      Present
    </button>
  ) : (
    <button style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px', borderRadius: '15px', fontSize: '15px' }}>
      <FaTimesCircle style={{ marginRight: '5px',marginTop:'-2px' }} />
      Absent
    </button>
  )}
</td>
        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{renderAvailabilityIcon(user.availability)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', color: 'black', textAlign: 'center' }}>
  {user.time_worked ? (
    <button style={{ backgroundColor: '#3498db', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '14px' }}>
      <FaClock style={{ marginRight: '5px' }} />
      {user.time_worked}
    </button>
  ) : (
    <LuTimerOff style={{ fontSize: '20px', color: '#e74c3c' }} />
  )}
</td>
        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
          <Button variant="primary" onClick={() => handlepointageClick(user)}>
            
            DÉTAILS</Button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

  
        {/* Pagination */}
        <div className="pagination" style={{marginLeft:'50px'}} >
          {Array.from({ length: Math.ceil(allUsersData.length / usersPerPage) }, (_, i) => (
            <button key={i + 1} onClick={() => paginate(i + 1)} style={{ backgroundColor: currentPage === i + 1 ? 'lightblue' : 'white' }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Modal for User Details */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Détails du pointage</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p><strong style={{ fontWeight: 'bold' }}>Employé : </strong> {selectedUser.firstname} {selectedUser.lastname}</p>
              <p><strong style={{ fontWeight: 'bold' }}>Heures travaillées : </strong> {selectedUser.time_worked}</p>
              <p><strong style={{ fontWeight: 'bold', marginLeft: '160px' }}>Date :</strong> {selectedDate}</p>
              <div style={{ marginTop: '20px' }}>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>Entrée</th>
                      <th style={{ textAlign: 'center' }}>Sortie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPointings.entre && userPointings.sortie ? (
                      userPointings.entre.map((entre, index) => (
                        <tr key={index}>
                          <td>{new Date(entre).toLocaleTimeString()}</td>
                          <td>{new Date(userPointings.sortie[index]).toLocaleTimeString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2">Aucun pointage disponible</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Dashboard;
