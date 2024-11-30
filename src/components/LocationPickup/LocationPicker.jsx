import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext'; // Assuming the context is defined here
import axios from 'axios';
import '../../style/locationpicker.css';

const Locationpicker = ({ handleClose }) => {
    const { city, handleChange } = useContext(AppContext); // Get the context value
    const [search, setSearch] = useState(''); // Local state for the search input
    const [locations, setLocations] = useState([]); // Local state for fetched locations
    const [loading, setLoading] = useState(false); // To handle loading state
    const [error, setError] = useState(''); // To handle any error during fetch
    const [cityName, setCityName] = useState(null); // State to store city name
    const [cities, setCities] = useState([]); // State to store all cities
    const [showCities, setShowCities] = useState(false); // State to toggle city display


    const fetchCities = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_HOST}/city/`, { mode: "cors" });
            const data = await response.json();

            // Filter out cities with the 'order' field
            const filteredCities = data.filter((city) => !city.order);
            setCities(filteredCities);  // Only set cities that do not have an 'order' field
            setShowCities(true);
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    };

    // Fetch locations from the API and set default city in localStorage if not already set
    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await axios.get(`${process.env.REACT_APP_HOST}/city/`);
                const fetchedLocations = response.data;

                // Sort locations by the 'createdAt' field (earliest created city first)
                const sortedLocations = fetchedLocations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                setLocations(sortedLocations); // Save the sorted locations

                // Check if there's a selected city in localStorage
                const storedCityId = localStorage.getItem('selectedCityId');

                if (sortedLocations.length > 0) {
                    // If no city is selected, set the first city (earliest created) as default
                    const defaultCity = sortedLocations[0];
                    handleChange(defaultCity.name); // Set it in the context
                    localStorage.setItem('selectedCityId', defaultCity._id); // Save the default city ID in localStorage
                    localStorage.setItem('selectedCityName', defaultCity.name); // Save the default city name in localStorage
                }
            } catch (err) {
                setError('Failed to fetch city data');
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []); // Fetch locations on component mount

    // Separate cities with an 'order' (popular cities) and without (all cities)
    const popularCities = locations.filter(city => city.order); // Cities with order field
    const allCities = locations.filter(city => !city.order); // Cities without order field

    // Filter backend locations based on search input
    const filteredBackendLocations = locations.filter((city) =>
        city.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectLocation = (cityName, cityId) => {
        handleChange(cityName); // Set the selected city using handleChange function
        localStorage.setItem('selectedCityId', cityId); // Save the selected city ID in localStorage
        localStorage.setItem('selectedCityName', cityName); // Save the selected city name in localStorage
        handleClose(); // Close the picker after selection
    };

    return (
        <div className="location-picker" style={{ padding: '20px' }}>
            <h3>Select a Location</h3>

            {/* Search Input with Icon */}
            <div className="search-container" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
            }}>
                <span style={{ marginRight: '10px' }}>
                    <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                        <title>Search</title>
                        <path d="M11.8 10.864L8.859 7.918a4.912 4.912 0 0 0-.444-6.47A4.888 4.888 0 0 0 4.928 0a4.888 4.888 0 0 0-3.485 1.449 4.942 4.942 0 0 0 0 6.979 4.888 4.888 0 0 0 3.485 1.449c1.052 0 2.105-.33 2.976-1.005l2.96 2.93a.658.658 0 0 0 .476.198.686.686 0 0 0 .477-.198.672.672 0 0 0-.016-.938zm-6.855-2.32c-.97 0-1.858-.38-2.549-1.054C1 6.09 1 3.802 2.396 2.387a3.578 3.578 0 0 1 2.549-1.054c.97 0 1.858.379 2.548 1.054s1.052 1.58 1.052 2.551c0 .971-.378 1.86-1.052 2.552a3.539 3.539 0 0 1-2.548 1.053z" fill="#777"></path>
                    </svg>
                </span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} // Update search state on input change
                    placeholder="Search for a city"
                    className="form-control"
                    style={{ border: 'none', outline: 'none', flexGrow: 1 }}
                />
            </div>

            {/* Filtered Cities Based on Search */}
            {search && (
                <ul style={{
                    width: '100%',
                    padding: 0,
                    marginTop: '10px',
                    marginBottom: '20px',
                    listStyleType: 'none',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                }}>
                    {filteredBackendLocations.length > 0 ? (
                        filteredBackendLocations.map((city) => (
                            <li
                                key={city._id}
                                style={{
                                    cursor: 'pointer',
                                    padding: '10px',
                                    borderBottom: '1px solid #e5e5e5',
                                }}
                                onClick={() => handleSelectLocation(city.name, city._id)} // Handle click event
                            >
                                {city.name}
                            </li>
                        ))
                    ) : (
                        <li style={{ padding: '10px', color: 'gray' }}>No cities found</li>
                    )}
                </ul>
            )}

            {/* Popular Cities Section */}
            <div className="container mt-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h4>Popular Cities</h4>
            </div>

            {/* Flexbox for Popular Locations */}
            <ul className="city-list row g-4 mt-2" style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                padding: 0,
            }}>
                {popularCities.map((city) => {
                    const isMobile = window.innerWidth <= 480;
                    const cityItemStyle = {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '10px',
                        borderBottom: '1px solid rgb(229, 229, 229)',
                        background: 'rgb(255, 255, 255)',
                        cursor: 'pointer',
                        margin: '5px',
                        width: isMobile ? 'calc(25% - 10px)' : 'calc(10% - 10px)', // 4 items per row on mobile, 10 items per row on desktop
                        boxSizing: 'border-box',
                        textAlign: 'center',
                    };

                    return (
                        <li
                            key={city._id}
                            style={cityItemStyle}
                            onClick={() => handleSelectLocation(city.name, city._id)} // Set the selected city on click
                        >
                            <div className="city-img-container" style={{ marginBottom: '5px' }}>
                                <img
                                    src={`${process.env.REACT_APP_HOST}${city.image}`}
                                    alt={city.name}
                                    style={{ width: '60px', height: '60px', borderRadius: '50%' }}
                                />
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'black' }}>
                                {city.name}
                            </span>
                        </li>
                    );
                })}
            </ul>

            {/* View All Cities Button */}
            <div className="d-flex flex-column align-items-center mt-3" style={{ marginBottom: '40px' }}>
                <a
                    href="#"

                    style={{ ...styles.viewAllButton, color: "#EC5E71", textDecoration: "none" }} // Style to make it look like a link
                    onClick={fetchCities} // Function to fetch the list of cities
                >
                    View All Cities
                </a>


                {showCities && (
                    <div className="container mt-2">
                        <div className="row g-4 justify-content-center mt-2"> {/* Bootstrap row with gap */}
                            {cities.length > 0 ? (
                                cities.map((city) => (
                                    <div
                                        key={city._id}
                                        className="col-3 col-sm-3 col-md-2 col-lg-1 d-flex flex-column align-items-center justify-content-center text-center mt-3"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleSelectLocation(city.name, city._id)}
                                    >
                                        <span className="fw-bold text-center">{city.name}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center">No cities available</p>
                            )}
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
};

const styles = {
    viewAllButton: {
        // backgroundColor: "#007bff",
        border: "none",
        padding: "10px 20px",
        color: "white",
        fontSize: "16px",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    citiesList: {
        marginTop: "20px",
        display: "grid",
        gap: "15px",
        gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", // Adjusts to screen size
    },
    cityCard: {
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "5px",
        boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
        textAlign: "center",
    },
    cityName: {
        margin: 0,
        fontSize: "14px",
        fontWeight: "bold",
    },
};


export default Locationpicker;