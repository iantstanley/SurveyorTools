document.addEventListener('DOMContentLoaded', function() {
    // Document Deciphering Form Submission
    const decipherForm = document.getElementById('decipher-form');
    if (decipherForm) {
        decipherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const resultDiv = document.getElementById('decipher-result');
            
            // Show loading indicator
            resultDiv.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Processing document...</p></div>';
            
            const formData = new FormData(this);
            fetch('/upload-document/', {
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
                if (data.text) {
                    resultDiv.innerHTML = '<div class="result-success"><h3>Document Text</h3><pre>' + data.text + '</pre></div>';
                    showNotification('Document processed successfully!', 'success');
                } else if (data.error) {
                    resultDiv.innerHTML = '<div class="result-error"><p>Error: ' + data.error + '</p></div>';
                    showNotification('Error: ' + data.error, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                resultDiv.innerHTML = '<div class="result-error"><p>Error processing document: ' + error.message + '</p></div>';
                showNotification('Error processing document.', 'error');
            });
        });
    }

    // Deed Information Extraction Form Submission
    const deedForm = document.getElementById('deed-form');
    if (deedForm) {
        deedForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const tableBody = document.getElementById('deed-table').querySelector('tbody');
            
            // Show loading indicator
            tableBody.innerHTML = '<tr><td colspan="6"><div class="loading-spinner"><div class="spinner"></div><p>Processing documents...</p></div></td></tr>';
            
            const formData = new FormData(this);
            fetch('/extract-deed-info/', {
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
                if (data.results && data.results.length > 0) {
                    // Clear existing rows
                    tableBody.innerHTML = '';
                    
                    data.results.forEach(function(result, index) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${result.date || ''}</td>
                            <td>${result.grantor || ''}</td>
                            <td>${result.grantee || ''}</td>
                            <td>${result.parcel_number || ''}</td>
                            <td>${result.address || ''}</td>
                            <td>
                                <button class="deed-details-toggle" data-index="${index}">Show Details</button>
                                <div class="deed-details-content" id="deed-details-${index}">
                                    ${result.legal_description ? `<div class="deed-legal-desc"><strong>Legal Description:</strong> ${result.legal_description}</div>` : ''}
                                    ${result.subdivision ? `<div><strong>Subdivision:</strong> ${result.subdivision}</div>` : ''}
                                    ${result.lot_number ? `<div><strong>Lot:</strong> ${result.lot_number}</div>` : ''}
                                    ${result.acreage ? `<div><strong>Acreage:</strong> ${result.acreage}</div>` : ''}
                                    ${(result.deed_book || result.deed_page) ? `<div class="deed-reference"><strong>Deed Reference:</strong> Book ${result.deed_book || 'N/A'}, Page ${result.deed_page || 'N/A'}</div>` : ''}
                                    ${(result.map_book || result.map_page) ? `<div class="deed-reference"><strong>Map Reference:</strong> Book ${result.map_book || 'N/A'}, Page ${result.map_page || 'N/A'}</div>` : ''}
                                </div>
                            </td>
                        `;
                        tableBody.appendChild(row);
                    });
                    
                    // Add toggle functionality for deed details
                    document.querySelectorAll('.deed-details-toggle').forEach(button => {
                        button.addEventListener('click', function() {
                            const index = this.getAttribute('data-index');
                            const detailsContent = document.getElementById(`deed-details-${index}`);
                            
                            if (detailsContent.classList.contains('show')) {
                                detailsContent.classList.remove('show');
                                this.textContent = 'Show Details';
                            } else {
                                detailsContent.classList.add('show');
                                this.textContent = 'Hide Details';
                            }
                        });
                    });
                    
                    showNotification(`Successfully processed ${data.results.length} documents!`, 'success');
                } else if (data.results && data.results.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="6">No information could be extracted from the documents.</td></tr>';
                    showNotification('No information could be extracted.', 'warning');
                } else if (data.error) {
                    tableBody.innerHTML = '<tr><td colspan="6">Error: ' + data.error + '</td></tr>';
                    showNotification('Error: ' + data.error, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                tableBody.innerHTML = '<tr><td colspan="6">Error processing documents: ' + error.message + '</td></tr>';
                showNotification('Error processing documents.', 'error');
            });
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
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