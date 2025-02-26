document.addEventListener('DOMContentLoaded', function() {
    // Command search functionality
    const commandSearch = document.getElementById('command-search');
    const commandList = document.querySelector('.command-list');
    
    if (commandSearch && commandList) {
        commandSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const commands = commandList.querySelectorAll('li');
            
            commands.forEach(command => {
                const text = command.textContent.toLowerCase();
                const shouldShow = text.includes(searchTerm);
                command.style.display = shouldShow ? 'block' : 'none';
            });
            
            // If no results found, show a message
            const visibleCommands = Array.from(commands).filter(cmd => cmd.style.display !== 'none');
            const noResultsMsg = document.getElementById('no-results-message');
            
            if (visibleCommands.length === 0 && searchTerm.length > 0) {
                if (!noResultsMsg) {
                    const message = document.createElement('p');
                    message.id = 'no-results-message';
                    message.textContent = 'No commands found matching your search.';
                    message.style.padding = '10px';
                    message.style.color = '#666';
                    message.style.textAlign = 'center';
                    commandList.parentNode.appendChild(message);
                }
            } else if (noResultsMsg) {
                noResultsMsg.remove();
            }
        });
    }
    
    // Category filtering
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    if (categoryButtons.length > 0 && commandList) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Update active button
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter commands
                const commands = commandList.querySelectorAll('li');
                
                if (category === 'all') {
                    commands.forEach(command => {
                        command.style.display = 'block';
                    });
                } else {
                    commands.forEach(command => {
                        const commandCategory = command.getAttribute('data-category');
                        command.style.display = commandCategory === category ? 'block' : 'none';
                    });
                }
                
                // Clear search field
                if (commandSearch) {
                    commandSearch.value = '';
                }
                
                // Remove no results message if present
                const noResultsMsg = document.getElementById('no-results-message');
                if (noResultsMsg) {
                    noResultsMsg.remove();
                }
            });
        });
    }
    
    // Command copy functionality
    const commandCopyButtons = document.querySelectorAll('.copy-command');
    
    if (commandCopyButtons.length > 0) {
        commandCopyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const commandText = this.getAttribute('data-command');
                
                // Copy to clipboard
                navigator.clipboard.writeText(commandText)
                    .then(() => {
                        // Success feedback
                        const originalText = this.innerHTML;
                        this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        
                        setTimeout(() => {
                            this.innerHTML = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy command: ', err);
                    });
            });
        });
    }
    
    // Expand/collapse command details
    const expandButtons = document.querySelectorAll('.expand-btn');
    
    if (expandButtons.length > 0) {
        expandButtons.forEach(button => {
            button.addEventListener('click', function() {
                const commandId = this.getAttribute('data-command-id');
                const details = document.getElementById('details-' + commandId);
                
                if (details) {
                    details.classList.toggle('expanded');
                    
                    if (details.classList.contains('expanded')) {
                        this.innerHTML = '<i class="fas fa-chevron-up"></i>';
                    } else {
                        this.innerHTML = '<i class="fas fa-chevron-down"></i>';
                    }
                }
            });
        });
    }
});