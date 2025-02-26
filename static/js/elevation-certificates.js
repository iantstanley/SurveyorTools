document.addEventListener('DOMContentLoaded', function() {
    // Building model classification system
    const modelUploadForm = document.getElementById('model-classification-form');
    const modelResultDiv = document.getElementById('model-classification-result');
    
    if (modelUploadForm) {
        modelUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading indicator
            modelResultDiv.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Analyzing building model...</p></div>';
            
            const formData = new FormData(this);
            fetch('/classify-building-model/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.model_type) {
                    // Create result content
                    let resultHTML = `
                        <div class="model-result">
                            <h3>Building Classification Result</h3>
                            <div class="model-result-main">
                                <div class="model-result-image">
                                    <img src="${data.image_url}" alt="Uploaded building image" />
                                </div>
                                <div class="model-result-info">
                                    <p class="model-type-label">Recommended Building Diagram:</p>
                                    <p class="model-type-value">Diagram ${data.model_type}</p>
                                    <p class="model-type-confidence">Confidence: ${data.confidence}%</p>
                                    <div class="model-type-description">
                                        <p>${data.description}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="model-guidance">
                                <p><strong>Note:</strong> This is an AI-assisted suggestion. Always verify with field measurements and professional judgment.</p>
                            </div>
                        </div>
                    `;
                    modelResultDiv.innerHTML = resultHTML;
                    
                    // Show the full description for the model type
                    const modelTypeElement = document.getElementById(`model-${data.model_type}`);
                    if (modelTypeElement) {
                        const detailsElement = modelTypeElement.querySelector('.model-details');
                        if (detailsElement) {
                            detailsElement.classList.add('show');
                        }
                    }
                    
                    showNotification('Building model classified successfully!', 'success');
                } else if (data.error) {
                    modelResultDiv.innerHTML = `<div class="result-error"><p>Error: ${data.error}</p></div>`;
                    showNotification('Error: ' + data.error, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                modelResultDiv.innerHTML = `<div class="result-error"><p>Error analyzing building: ${error.message}</p></div>`;
                showNotification('Error processing image.', 'error');
            });
        });
    }
    
    // Building model details toggle
    const modelDetailToggles = document.querySelectorAll('.model-details-toggle');
    if (modelDetailToggles.length > 0) {
        modelDetailToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const modelId = this.getAttribute('data-model');
                const details = document.getElementById(`details-${modelId}`);
                
                if (details) {
                    if (details.classList.contains('show')) {
                        details.classList.remove('show');
                        this.textContent = 'Show Details';
                    } else {
                        details.classList.add('show');
                        this.textContent = 'Hide Details';
                    }
                }
            });
        });
    }
    
    // Flood zone lookup
    const floodZoneLookupForm = document.getElementById('flood-zone-lookup-form');
    const floodZoneResultDiv = document.getElementById('flood-zone-result');
    
    if (floodZoneLookupForm) {
        floodZoneLookupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a full implementation, this would call an API to get flood zone data
            // For now, we'll simulate a result
            const address = document.getElementById('flood-zone-address').value;
            
            if (!address.trim()) {
                showNotification('Please enter an address to search.', 'warning');
                return;
            }
            
            floodZoneResultDiv.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Looking up flood zone information...</p></div>';
            
            // Simulate API delay
            setTimeout(() => {
                // This is where you would process the actual response from the API
                // For demonstration purposes, we're generating a simulated result
                const isInBrunswick = address.toLowerCase().includes('brunswick') || 
                                     address.toLowerCase().includes('leland') || 
                                     address.toLowerCase().includes('southport') || 
                                     address.toLowerCase().includes('oak island');
                
                if (isInBrunswick) {
                    const zones = ['AE', 'VE', 'X', 'A', 'AO'];
                    const zone = zones[Math.floor(Math.random() * zones.length)];
                    const bfe = zone === 'X' ? 'N/A' : (Math.floor(Math.random() * 20) + 5);
                    
                    const resultHTML = `
                        <div class="flood-zone-result-content">
                            <h3>Flood Zone Information</h3>
                            <p><strong>Address:</strong> ${address}</p>
                            <div class="result-section">
                                <p><strong>Flood Zone:</strong> <span class="zone-${zone}">${zone}</span></p>
                                ${zone !== 'X' ? `<p><strong>Base Flood Elevation (BFE):</strong> ${bfe}' NAVD88</p>` : ''}
                                <p><strong>Community:</strong> Brunswick County, NC</p>
                                <p><strong>Panel Number:</strong> 37019C${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}K</p>
                                <p><strong>Effective Date:</strong> August 28, 2018</p>
                            </div>
                            <div class="zone-info">
                                ${getZoneDescription(zone)}
                            </div>
                            <div class="action-links">
                                <a href="https://fris.nc.gov/fris/Home.aspx?ST=NC" target="_blank" class="btn-link">View on NC FRIS</a>
                                <a href="https://msc.fema.gov/portal/search" target="_blank" class="btn-link">FEMA Map Service Center</a>
                            </div>
                            <div class="disclaimer">
                                <p><strong>Note:</strong> This is a simulated result for demonstration purposes only. For official flood zone determination, please visit the <a href="https://fris.nc.gov/fris/Home.aspx?ST=NC" target="_blank">North Carolina FRIS</a> website or consult with a licensed surveyor.</p>
                            </div>
                        </div>
                    `;
                    floodZoneResultDiv.innerHTML = resultHTML;
                } else {
                    floodZoneResultDiv.innerHTML = `
                        <div class="result-error">
                            <p>Could not determine flood zone information for the provided address. Please ensure it is a valid Brunswick County address.</p>
                            <p>For official flood zone determination, please visit the <a href="https://fris.nc.gov/fris/Home.aspx?ST=NC" target="_blank">North Carolina FRIS</a> website.</p>
                        </div>
                    `;
                }
            }, 1500);
        });
    }
    
    // Helper function for flood zone descriptions
    function getZoneDescription(zone) {
        const descriptions = {
            'AE': '<p><strong>Zone AE:</strong> Areas subject to inundation by the 1% annual chance flood event. Base Flood Elevations (BFEs) are shown within these zones.</p><p>Mandatory flood insurance purchase requirements apply.</p>',
            'VE': '<p><strong>Zone VE:</strong> Coastal areas subject to inundation by the 1% annual chance flood event with additional hazards due to storm-induced velocity wave action. BFEs are shown within these zones.</p><p>Mandatory flood insurance purchase requirements apply.</p>',
            'X': '<p><strong>Zone X:</strong> Areas of minimal flood hazard, usually depicted on FIRMs as above the 500-year flood level. Zone X is the area determined to be outside the 500-year flood and protected by levee from 100-year flood.</p><p>Insurance purchase is not required in these zones.</p>',
            'A': '<p><strong>Zone A:</strong> Areas subject to inundation by the 1% annual chance flood event. Because detailed hydraulic analyses have not been performed, no BFEs are shown.</p><p>Mandatory flood insurance purchase requirements apply.</p>',
            'AO': '<p><strong>Zone AO:</strong> Areas subject to inundation by 1% annual chance shallow flooding (usually sheet flow on sloping terrain) where average depths are 1-3 feet. Average flood depths derived from detailed hydraulic analyses are shown within this zone.</p><p>Mandatory flood insurance purchase requirements apply.</p>'
        };
        
        return descriptions[zone] || '<p>No specific information available for this zone.</p>';
    }
    
    // Notification function (reused from document-processing.js)
    function showNotification(message, type = 'info') {
        // Check if the notification system already exists
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', function() {
            document.body.removeChild(notification);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('notification-hide');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }
        }, 5000);
    }
});