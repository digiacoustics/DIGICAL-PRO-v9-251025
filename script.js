class DigicalPro {
    constructor() {
        this.rooms = [];
        this.currentRoomIndex = 0;
        this.projectData = {
            name: '',
            client: '',
            location: '',
            notes: ''
        };
        this.maxProjects = 90;
        this.init();
    }

    init() {
        this.updateTimestamp();
        this.addRoom();
        this.loadSavedProjects();
    }

    updateTimestamp() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        document.getElementById('timestamp').textContent = 
            `Generated on: ${now.toLocaleDateString('en-IN', options)}`;
    }

    addRoom() {
        const roomNumber = this.rooms.length + 1;
        const newRoom = {
            id: Date.now(),
            name: `Room ${roomNumber}`,
            length: '',
            width: '',
            height: '',
            acousticDoors: '',
            deductions: [],
            additionalAreas: [],
            pricing: {
                wallPrice: '',
                ceilingPrice: '',
                floorPrice: '',
                doorPrice: '',
                additionalPrice: ''
            }
        };
        
        this.rooms.push(newRoom);
        this.currentRoomIndex = this.rooms.length - 1;
        this.renderRoomTabs();
        this.renderRoomForm();
    }

    deleteRoom(index) {
        if (this.rooms.length > 1) {
            this.rooms.splice(index, 1);
            if (this.currentRoomIndex >= this.rooms.length) {
                this.currentRoomIndex = this.rooms.length - 1;
            }
            this.renderRoomTabs();
            this.renderRoomForm();
        } else {
            this.showMessage('Cannot delete the last room', 'error');
        }
    }

    switchRoom(index) {
        this.saveCurrentRoomData();
        this.currentRoomIndex = index;
        this.renderRoomTabs();
        this.renderRoomForm();
    }

    renderRoomTabs() {
        const tabsContainer = document.getElementById('roomTabs');
        tabsContainer.innerHTML = '';
        
        this.rooms.forEach((room, index) => {
            const tab = document.createElement('div');
            tab.className = `room-tab ${index === this.currentRoomIndex ? 'active' : ''}`;
            tab.innerHTML = `
                ${room.name}
                ${this.rooms.length > 1 ? `<button class="delete-room" onclick="app.deleteRoom(${index})">×</button>` : ''}
            `;
            tab.onclick = (e) => {
                if (!e.target.classList.contains('delete-room')) {
                    this.switchRoom(index);
                }
            };
            tabsContainer.appendChild(tab);
        });
    }

    renderRoomForm() {
        const room = this.rooms[this.currentRoomIndex];
        const formContainer = document.getElementById('roomForm');
        
        formContainer.innerHTML = `
            <h3>Room Details</h3>
            <div class="input-group">
                <label for="roomName">Room Name</label>
                <input type="text" id="roomName" value="${room.name}" onchange="app.updateRoomData('name', this.value)" placeholder="Enter room name">
            </div>
            
            <h4>Dimensions</h4>
            <div class="dimensions-grid">
                <div class="input-group">
                    <label for="roomLength">Length (feet)</label>
                    <input type="number" id="roomLength" value="${room.length}" step="0.1" onchange="app.updateRoomData('length', this.value)" placeholder="0.0">
                </div>
                <div class="input-group">
                    <label for="roomWidth">Width (feet)</label>
                    <input type="number" id="roomWidth" value="${room.width}" step="0.1" onchange="app.updateRoomData('width', this.value)" placeholder="0.0">
                </div>
                <div class="input-group">
                    <label for="roomHeight">Height (feet)</label>
                    <input type="number" id="roomHeight" value="${room.height}" step="0.1" onchange="app.updateRoomData('height', this.value)" placeholder="0.0">
                </div>
                <div class="input-group">
                    <label for="acousticDoors">Acoustic Doors (Qty)</label>
                    <input type="number" id="acousticDoors" value="${room.acousticDoors}" onchange="app.updateRoomData('acousticDoors', this.value)" placeholder="0">
                </div>
            </div>
            
            <h4>Deductions</h4>
            <div id="deductionsContainer">${this.renderDeductions(room.deductions)}</div>
            <button class="btn btn-save" onclick="app.addDeduction()">+ Add Deduction</button>
            
            <h4>Additional Areas</h4>
            <div id="additionalAreasContainer">${this.renderAdditionalAreas(room.additionalAreas)}</div>
            <button class="btn btn-save" onclick="app.addAdditionalArea()">+ Add Additional Area</button>
            
            <h4>Pricing (INR per sq ft / unit)</h4>
            <div class="pricing-grid">
                <div class="input-group">
                    <label for="wallPrice">Wall Area Price (INR/sq ft)</label>
                    <input type="number" id="wallPrice" value="${room.pricing.wallPrice}" step="0.01" onchange="app.updatePricing('wallPrice', this.value)" placeholder="0.00">
                </div>
                <div class="input-group">
                    <label for="ceilingPrice">Ceiling Area Price (INR/sq ft)</label>
                    <input type="number" id="ceilingPrice" value="${room.pricing.ceilingPrice}" step="0.01" onchange="app.updatePricing('ceilingPrice', this.value)" placeholder="0.00">
                </div>
                <div class="input-group">
                    <label for="floorPrice">Floor Area Price (INR/sq ft)</label>
                    <input type="number" id="floorPrice" value="${room.pricing.floorPrice}" step="0.01" onchange="app.updatePricing('floorPrice', this.value)" placeholder="0.00">
                </div>
                <div class="input-group">
                    <label for="doorPrice">Acoustic Door Price (INR/unit)</label>
                    <input type="number" id="doorPrice" value="${room.pricing.doorPrice}" step="0.01" onchange="app.updatePricing('doorPrice', this.value)" placeholder="0.00">
                </div>
                <div class="input-group">
                    <label for="additionalPrice">Additional Area Price (INR/sq ft)</label>
                    <input type="number" id="additionalPrice" value="${room.pricing.additionalPrice}" step="0.01" onchange="app.updatePricing('additionalPrice', this.value)" placeholder="0.00">
                </div>
            </div>
        `;
    }

    renderDeductions(deductions) {
        return deductions.map((deduction, index) => `
            <div class="deduction-item">
                <div class="input-group">
                    <label>Deduction Name</label>
                    <input type="text" value="${deduction.name}" onchange="app.updateDeduction(${index}, 'name', this.value)" placeholder="Enter deduction name">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">
                    <div class="input-group">
                        <label>Length (feet)</label>
                        <input type="number" value="${deduction.length}" step="0.1" onchange="app.updateDeduction(${index}, 'length', this.value)" placeholder="0.0">
                    </div>
                    <div class="input-group">
                        <label>Height (feet)</label>
                        <input type="number" value="${deduction.height}" step="0.1" onchange="app.updateDeduction(${index}, 'height', this.value)" placeholder="0.0">
                    </div>
                    <button class="btn btn-reset" onclick="app.removeDeduction(${index})" style="height: 45px;">Remove</button>
                </div>
            </div>
        `).join('');
    }

    renderAdditionalAreas(areas) {
        return areas.map((area, index) => `
            <div class="additional-area-item">
                <div class="input-group">
                    <label>Area Name</label>
                    <input type="text" value="${area.name}" onchange="app.updateAdditionalArea(${index}, 'name', this.value)" placeholder="Enter area name">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">
                    <div class="input-group">
                        <label>Length (feet)</label>
                        <input type="number" value="${area.length}" step="0.1" onchange="app.updateAdditionalArea(${index}, 'length', this.value)" placeholder="0.0">
                    </div>
                    <div class="input-group">
                        <label>Height (feet)</label>
                        <input type="number" value="${area.height}" step="0.1" onchange="app.updateAdditionalArea(${index}, 'height', this.value)" placeholder="0.0">
                    </div>
                    <button class="btn btn-reset" onclick="app.removeAdditionalArea(${index})" style="height: 45px;">Remove</button>
                </div>
            </div>
        `).join('');
    }

    updateRoomData(field, value) {
        this.rooms[this.currentRoomIndex][field] = value;
        if (field === 'name') {
            this.renderRoomTabs();
        }
    }

    updatePricing(field, value) {
        this.rooms[this.currentRoomIndex].pricing[field] = value;
    }

    addDeduction() {
        this.rooms[this.currentRoomIndex].deductions.push({
            name: '',
            length: '',
            height: ''
        });
        this.renderRoomForm();
    }

    updateDeduction(index, field, value) {
        this.rooms[this.currentRoomIndex].deductions[index][field] = value;
    }

    removeDeduction(index) {
        this.rooms[this.currentRoomIndex].deductions.splice(index, 1);
        this.renderRoomForm();
    }

    addAdditionalArea() {
        this.rooms[this.currentRoomIndex].additionalAreas.push({
            name: '',
            length: '',
            height: ''
        });
        this.renderRoomForm();
    }

    updateAdditionalArea(index, field, value) {
        this.rooms[this.currentRoomIndex].additionalAreas[index][field] = value;
    }

    removeAdditionalArea(index) {
        this.rooms[this.currentRoomIndex].additionalAreas.splice(index, 1);
        this.renderRoomForm();
    }

    saveCurrentRoomData() {
        const projectName = document.getElementById('projectName').value;
        const clientName = document.getElementById('clientName').value;
        const location = document.getElementById('location').value;
        
        this.projectData = { name: projectName, client: clientName, location: location, notes: this.projectData.notes };
    }

    calculateRoomAreas(room) {
        const length = parseFloat(room.length) || 0;
        const width = parseFloat(room.width) || 0;
        const height = parseFloat(room.height) || 0;
        
        const wall1 = length * height;
        const wall2 = width * height;
        const wall3 = length * height;
        const wall4 = width * height;
        const grossWallArea = wall1 + wall2 + wall3 + wall4;
        
        const totalDeductions = room.deductions.reduce((sum, deduction) => 
            sum + ((parseFloat(deduction.length) || 0) * (parseFloat(deduction.height) || 0)), 0);
        
        const netWallArea = grossWallArea - totalDeductions;
        
        const totalAdditionalArea = room.additionalAreas.reduce((sum, area) => 
            sum + ((parseFloat(area.length) || 0) * (parseFloat(area.height) || 0)), 0);
        
        const ceilingArea = length * width;
        const floorArea = length * width;
        
        return {
            walls: { wall1, wall2, wall3, wall4, gross: grossWallArea, net: netWallArea },
            deductions: totalDeductions,
            additional: totalAdditionalArea,
            ceiling: ceilingArea,
            floor: floorArea,
            acousticDoors: parseInt(room.acousticDoors) || 0
        };
    }

    calculatePricing(areas, pricing) {
        const wallCost = areas.walls.net * (parseFloat(pricing.wallPrice) || 0);
        const ceilingCost = areas.ceiling * (parseFloat(pricing.ceilingPrice) || 0);
        const floorCost = areas.floor * (parseFloat(pricing.floorPrice) || 0);
        const doorCost = areas.acousticDoors * (parseFloat(pricing.doorPrice) || 0);
        const additionalCost = areas.additional * (parseFloat(pricing.additionalPrice) || 0);
        
        return {
            wall: wallCost,
            ceiling: ceilingCost,
            floor: floorCost,
            doors: doorCost,
            additional: additionalCost,
            total: wallCost + ceilingCost + floorCost + doorCost + additionalCost
        };
    }

    calculateAll() {
        this.saveCurrentRoomData();
        
        let roomResults = '';
        let totalProjectCost = 0;
        let totalWallArea = 0;
        let totalCeilingArea = 0;
        let totalFloorArea = 0;
        
        this.rooms.forEach((room, index) => {
            const areas = this.calculateRoomAreas(room);
            const costs = this.calculatePricing(areas, room.pricing);
            
            totalProjectCost += costs.total;
            totalWallArea += areas.walls.net;
            totalCeilingArea += areas.ceiling;
            totalFloorArea += areas.floor;
            
            roomResults += `
                <div class="room-result">
                    <h3>${room.name}</h3>
                    <div class="calculation-row">
                        <span>Length × Height (Wall 1 & 3):</span>
                        <span>${parseFloat(room.length) || 0} × ${parseFloat(room.height) || 0} = ${areas.walls.wall1.toFixed(2)} sq ft each</span>
                    </div>
                    <div class="calculation-row">
                        <span>Width × Height (Wall 2 & 4):</span>
                        <span>${parseFloat(room.width) || 0} × ${parseFloat(room.height) || 0} = ${areas.walls.wall2.toFixed(2)} sq ft each</span>
                    </div>
                    <div class="calculation-row">
                        <span>Gross Wall Area:</span>
                        <span>${areas.walls.gross.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calculation-row">
                        <span>Total Deductions:</span>
                        <span>${areas.deductions.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calculation-row">
                        <span>Net Wall Area:</span>
                        <span>${areas.walls.net.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calculation-row">
                        <span>Ceiling Area:</span>
                        <span>${areas.ceiling.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calculation-row">
                        <span>Floor Area:</span>
                        <span>${areas.floor.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calculation-row">
                        <span>Additional Areas:</span>
                        <span>${areas.additional.toFixed(2)} sq ft</span>
                    </div>
                    <div class="calculation-row">
                        <span>Acoustic Doors:</span>
                        <span>${areas.acousticDoors} units</span>
                    </div>
                    <hr style="margin: 15px 0;">
                    <div class="calculation-row">
                        <span>Wall Cost:</span>
                        <span>${costs.wall > 0 ? '₹' + costs.wall.toLocaleString('en-IN', {maximumFractionDigits: 2}) : 'N/A'}</span>
                    </div>
                    <div class="calculation-row">
                        <span>Ceiling Cost:</span>
                        <span>${costs.ceiling > 0 ? '₹' + costs.ceiling.toLocaleString('en-IN', {maximumFractionDigits: 2}) : 'N/A'}</span>
                    </div>
                    <div class="calculation-row">
                        <span>Floor Cost:</span>
                        <span>${costs.floor > 0 ? '₹' + costs.floor.toLocaleString('en-IN', {maximumFractionDigits: 2}) : 'N/A'}</span>
                    </div>
                    <div class="calculation-row">
                        <span>Doors Cost:</span>
                        <span>${costs.doors > 0 ? '₹' + costs.doors.toLocaleString('en-IN', {maximumFractionDigits: 2}) : 'N/A'}</span>
                    </div>
                    <div class="calculation-row">
                        <span>Additional Areas Cost:</span>
                        <span>${costs.additional > 0 ? '₹' + costs.additional.toLocaleString('en-IN', {maximumFractionDigits: 2}) : 'N/A'}</span>
                    </div>
                    <div class="calculation-row">
                        <span><strong>Room Total:</strong></span>
                        <span><strong>₹${costs.total.toLocaleString('en-IN', {maximumFractionDigits: 2})}</strong></span>
                    </div>
                </div>
            `;
        });
        
        const projectSummary = `
            <h3>Project Summary</h3>
            <div class="calculation-row">
                <span>Project Name:</span>
                <span>${this.projectData.name || 'Untitled Project'}</span>
            </div>
            <div class="calculation-row">
                <span>Client:</span>
                <span>${this.projectData.client || 'N/A'}</span>
            </div>
            <div class="calculation-row">
                <span>Location:</span>
                <span>${this.projectData.location || 'N/A'}</span>
            </div>
            <div class="calculation-row">
                <span>Total Rooms:</span>
                <span>${this.rooms.length}</span>
            </div>
            <div class="calculation-row">
                <span>Total Wall Area:</span>
                <span>${totalWallArea.toFixed(2)} sq ft</span>
            </div>
            <div class="calculation-row">
                <span>Total Ceiling Area:</span>
                <span>${totalCeilingArea.toFixed(2)} sq ft</span>
            </div>
            <div class="calculation-row">
                <span>Total Floor Area:</span>
                <span>${totalFloorArea.toFixed(2)} sq ft</span>
            </div>
            <div class="calculation-row">
                <span><strong>TOTAL PROJECT COST:</strong></span>
                <span><strong>₹${totalProjectCost.toLocaleString('en-IN', {maximumFractionDigits: 2})}</strong></span>
            </div>
        `;
        
        document.getElementById('roomResults').innerHTML = roomResults;
        document.getElementById('projectSummary').innerHTML = projectSummary;
        
        this.showMessage('Calculations completed successfully!', 'success');
    }

    saveProject() {
        this.saveCurrentRoomData();
        
        const projectData = {
            ...this.projectData,
            rooms: this.rooms,
            savedAt: new Date().toISOString()
        };
        
        let savedProjects = JSON.parse(localStorage.getItem('digicalProjects') || '[]');
        
        if (savedProjects.length >= this.maxProjects) {
            const existingIndex = savedProjects.findIndex(p => p.name === projectData.name);
            if (existingIndex === -1) {
                this.showMessage(`Cannot save! Maximum ${this.maxProjects} projects limit reached. Delete old projects first.`, 'error');
                return;
            }
        }
        
        const existingIndex = savedProjects.findIndex(p => p.name === projectData.name);
        
        if (existingIndex >= 0) {
            savedProjects[existingIndex] = projectData;
            this.showMessage('Project updated successfully!', 'success');
        } else {
            savedProjects.push(projectData);
            this.showMessage(`Project saved! (${savedProjects.length}/${this.maxProjects})`, 'success');
        }
        
        localStorage.setItem('digicalProjects', JSON.stringify(savedProjects));
    }

    loadProject() {
        this.loadSavedProjects();
        document.getElementById('loadModal').style.display = 'block';
    }

    loadSavedProjects() {
        const savedProjects = JSON.parse(localStorage.getItem('digicalProjects') || '[]');
        const listContainer = document.getElementById('savedProjectsList');
        const countContainer = document.getElementById('projectCount');
        
        countContainer.textContent = `Saved Projects: ${savedProjects.length} / ${this.maxProjects}`;
        
        if (savedProjects.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: #666;">No saved projects found.</p>';
            return;
        }
        
        savedProjects.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        
        listContainer.innerHTML = savedProjects.map((project, index) => `
            <div class="saved-project-item">
                <div class="project-info" onclick="app.loadSavedProject(${index})">
                    <h4>${project.name || 'Untitled Project'}</h4>
                    <p>Client: ${project.client || 'N/A'}</p>
                    <p>Rooms: ${project.rooms?.length || 0}</p>
                    <p>Saved: ${new Date(project.savedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <button class="btn btn-reset delete-project-btn" onclick="app.deleteSavedProject(${index})" title="Delete Project">
                    Delete
                </button>
            </div>
        `).join('');
    }

    loadSavedProject(index) {
        const savedProjects = JSON.parse(localStorage.getItem('digicalProjects') || '[]');
        savedProjects.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        const project = savedProjects[index];
        
        if (project) {
            this.projectData = {
                name: project.name || '',
                client: project.client || '',
                location: project.location || '',
                notes: project.notes || ''
            };
            
            this.rooms = project.rooms || [];
            this.currentRoomIndex = 0;
            
            document.getElementById('projectName').value = this.projectData.name;
            document.getElementById('clientName').value = this.projectData.client;
            document.getElementById('location').value = this.projectData.location;
            
            this.renderRoomTabs();
            this.renderRoomForm();
            this.closeLoadModal();
            this.showMessage('Project loaded successfully!', 'success');
        }
    }

    deleteSavedProject(index) {
        let savedProjects = JSON.parse(localStorage.getItem('digicalProjects') || '[]');
        savedProjects.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        const project = savedProjects[index];
        
        if (project && confirm(`Are you sure you want to delete "${project.name || 'Untitled Project'}"? This action cannot be undone.`)) {
            savedProjects.splice(index, 1);
            localStorage.setItem('digicalProjects', JSON.stringify(savedProjects));
            this.loadSavedProjects();
            this.showMessage('Project deleted successfully!', 'success');
        }
    }

    closeLoadModal() {
        document.getElementById('loadModal').style.display = 'none';
    }

    toggleNotes() {
        const notesSection = document.getElementById('notesSection');
        const isVisible = notesSection.style.display !== 'none';
        notesSection.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            document.getElementById('projectNotes').value = this.projectData.notes;
        }
    }

    saveNotes() {
        this.projectData.notes = document.getElementById('projectNotes').value;
        this.closeNotes();
        this.showMessage('Notes saved!', 'success');
    }

    closeNotes() {
        document.getElementById('notesSection').style.display = 'none';
    }

    // NEW: Data Import/Export Functions
    toggleDataModal() {
        document.getElementById('dataModal').style.display = 'block';
    }

    closeDataModal() {
        document.getElementById('dataModal').style.display = 'none';
    }

    exportAllProjects() {
        const savedProjects = JSON.parse(localStorage.getItem('digicalProjects') || '[]');
        
        if (savedProjects.length === 0) {
            this.showMessage('No projects to export!', 'error');
            return;
        }
        
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            projectCount: savedProjects.length,
            projects: savedProjects
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `DIGICAL_Pro_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showMessage(`Exported ${savedProjects.length} projects successfully!`, 'success');
        this.closeDataModal();
    }

    importProjects(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (!importData.projects || !Array.isArray(importData.projects)) {
                    throw new Error('Invalid backup file format');
                }
                
                let savedProjects = JSON.parse(localStorage.getItem('digicalProjects') || '[]');
                let importedCount = 0;
                let updatedCount = 0;
                let skippedCount = 0;
                
                importData.projects.forEach(importProject => {
                    const existingIndex = savedProjects.findIndex(p => p.name === importProject.name);
                    
                    if (existingIndex >= 0) {
                        savedProjects[existingIndex] = importProject;
                        updatedCount++;
                    } else if (savedProjects.length < this.maxProjects) {
                        savedProjects.push(importProject);
                        importedCount++;
                    } else {
                        skippedCount++;
                    }
                });
                
                localStorage.setItem('digicalProjects', JSON.stringify(savedProjects));
                
                let message = `Import completed! `;
                if (importedCount > 0) message += `${importedCount} new, `;
                if (updatedCount > 0) message += `${updatedCount} updated, `;
                if (skippedCount > 0) message += `${skippedCount} skipped (limit reached)`;
                
                this.showMessage(message, 'success');
                this.closeDataModal();
                
                document.getElementById('importFile').value = '';
                
            } catch (error) {
                console.error('Import error:', error);
                this.showMessage('Failed to import! Invalid file format.', 'error');
            }
        };
        
        reader.onerror = () => {
            this.showMessage('Failed to read file!', 'error');
        };
        
        reader.readAsText(file);
    }

    shareResults() {
        const resultsContent = this.generateShareContent();
        
        if (navigator.share) {
            navigator.share({
                title: 'DIGICAL Pro - Detailed Report',
                text: resultsContent
            });
        } else {
            navigator.clipboard.writeText(resultsContent).then(() => {
                this.showMessage('Detailed report copied to clipboard!', 'success');
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = resultsContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showMessage('Detailed report copied to clipboard!', 'success');
            });
        }
    }

    generateShareContent() {
        this.saveCurrentRoomData();
        
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        
        let content = `╔═══════════════════════════════════════════════════════════╗\n`;
        content += `║       DIGICAL Pro - DETAILED CALCULATION REPORT          ║\n`;
        content += `║              Powered by Digi Acoustics                   ║\n`;
        content += `╚═══════════════════════════════════════════════════════════╝\n\n`;
        
        content += `┌─────────────────────────────────────────────────────────┐\n`;
        content += `│ PROJECT INFORMATION                                     │\n`;
        content += `├─────────────────────────────────────────────────────────┤\n`;
        content += `│ Project Name : ${(this.projectData.name || 'Untitled').padEnd(42)}│\n`;
        content += `│ Client Name  : ${(this.projectData.client || 'N/A').padEnd(42)}│\n`;
        content += `│ Location     : ${(this.projectData.location || 'N/A').padEnd(42)}│\n`;
        content += `│ Total Rooms  : ${String(this.rooms.length).padEnd(42)}│\n`;
        content += `└─────────────────────────────────────────────────────────┘\n\n`;
        
        let totalProjectCost = 0;
        let totalWallArea = 0;
        let totalCeilingArea = 0;
        let totalFloorArea = 0;
        let totalAdditionalArea = 0;
        let totalDoors = 0;
        
        this.rooms.forEach((room, index) => {
            const areas = this.calculateRoomAreas(room);
            const costs = this.calculatePricing(areas, room.pricing);
            totalProjectCost += costs.total;
            totalWallArea += areas.walls.net;
            totalCeilingArea += areas.ceiling;
            totalFloorArea += areas.floor;
            totalAdditionalArea += areas.additional;
            totalDoors += areas.acousticDoors;
            
            content += `┌─────────────────────────────────────────────────────────┐\n`;
            content += `│ ROOM ${index + 1}: ${room.name.padEnd(48)}│\n`;
            content += `├─────────────────────────────────────────────────────────┤\n`;
            content += `│ Dimensions: ${parseFloat(room.length) || 0}' × ${parseFloat(room.width) || 0}' × ${parseFloat(room.height) || 0}'${' '.repeat(Math.max(0, 32 - String(`${parseFloat(room.length) || 0}' × ${parseFloat(room.width) || 0}' × ${parseFloat(room.height) || 0}'`).length))}│\n`;
            content += `├─────────────────────────────────────────────────────────┤\n`;
            content += `│ AREA CALCULATIONS:                                      │\n`;
            content += `│  • Wall 1 & 3: ${parseFloat(room.length) || 0}' × ${parseFloat(room.height) || 0}' = ${areas.walls.wall1.toFixed(2)} sq ft each${'  '.padEnd(Math.max(0, 12 - String(areas.walls.wall1.toFixed(2)).length))}│\n`;
            content += `│  • Wall 2 & 4: ${parseFloat(room.width) || 0}' × ${parseFloat(room.height) || 0}' = ${areas.walls.wall2.toFixed(2)} sq ft each${'  '.padEnd(Math.max(0, 12 - String(areas.walls.wall2.toFixed(2)).length))}│\n`;
            content += `│  • Gross Wall Area: ${areas.walls.gross.toFixed(2)} sq ft${' '.repeat(Math.max(0, 27 - String(areas.walls.gross.toFixed(2)).length))}│\n`;
            content += `│  • Total Deductions: ${areas.deductions.toFixed(2)} sq ft${' '.repeat(Math.max(0, 26 - String(areas.deductions.toFixed(2)).length))}│\n`;
            content += `│  • Net Wall Area: ${areas.walls.net.toFixed(2)} sq ft${' '.repeat(Math.max(0, 29 - String(areas.walls.net.toFixed(2)).length))}│\n`;
            content += `│  • Ceiling Area: ${areas.ceiling.toFixed(2)} sq ft${' '.repeat(Math.max(0, 30 - String(areas.ceiling.toFixed(2)).length))}│\n`;
            content += `│  • Floor Area: ${areas.floor.toFixed(2)} sq ft${' '.repeat(Math.max(0, 32 - String(areas.floor.toFixed(2)).length))}│\n`;
            
            if (areas.additional > 0) {
                content += `│  • Additional Areas: ${areas.additional.toFixed(2)} sq ft${' '.repeat(Math.max(0, 26 - String(areas.additional.toFixed(2)).length))}│\n`;
            }
            if (areas.acousticDoors > 0) {
                content += `│  • Acoustic Doors: ${areas.acousticDoors} units${' '.repeat(Math.max(0, 31 - String(areas.acousticDoors).length))}│\n`;
            }
            
            content += `├─────────────────────────────────────────────────────────┤\n`;
            content += `│ PRICING BREAKDOWN:                                      │\n`;
            
            if (costs.wall > 0) {
                content += `│  • Wall: ${areas.walls.net.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.wallPrice) || 0}${' '.repeat(Math.max(0, 28 - String(`${areas.walls.net.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.wallPrice) || 0}`).length))}│\n`;
                content += `│    = ₹${costs.wall.toLocaleString('en-IN')}${' '.repeat(Math.max(0, 52 - String(costs.wall.toLocaleString('en-IN')).length))}│\n`;
            }
            if (costs.ceiling > 0) {
                content += `│  • Ceiling: ${areas.ceiling.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.ceilingPrice) || 0}${' '.repeat(Math.max(0, 25 - String(`${areas.ceiling.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.ceilingPrice) || 0}`).length))}│\n`;
                content += `│    = ₹${costs.ceiling.toLocaleString('en-IN')}${' '.repeat(Math.max(0, 52 - String(costs.ceiling.toLocaleString('en-IN')).length))}│\n`;
            }
            if (costs.floor > 0) {
                content += `│  • Floor: ${areas.floor.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.floorPrice) || 0}${' '.repeat(Math.max(0, 27 - String(`${areas.floor.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.floorPrice) || 0}`).length))}│\n`;
                content += `│    = ₹${costs.floor.toLocaleString('en-IN')}${' '.repeat(Math.max(0, 52 - String(costs.floor.toLocaleString('en-IN')).length))}│\n`;
            }
            if (costs.doors > 0) {
                content += `│  • Doors: ${areas.acousticDoors} units × ₹${parseFloat(room.pricing.doorPrice) || 0}${' '.repeat(Math.max(0, 29 - String(`${areas.acousticDoors} units × ₹${parseFloat(room.pricing.doorPrice) || 0}`).length))}│\n`;
                content += `│    = ₹${costs.doors.toLocaleString('en-IN')}${' '.repeat(Math.max(0, 52 - String(costs.doors.toLocaleString('en-IN')).length))}│\n`;
            }
            if (costs.additional > 0) {
                content += `│  • Additional: ${areas.additional.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.additionalPrice) || 0}${' '.repeat(Math.max(0, 22 - String(`${areas.additional.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.additionalPrice) || 0}`).length))}│\n`;
                content += `│    = ₹${costs.additional.toLocaleString('en-IN')}${' '.repeat(Math.max(0, 52 - String(costs.additional.toLocaleString('en-IN')).length))}│\n`;
            }
            
            content += `├─────────────────────────────────────────────────────────┤\n`;
            content += `│ ROOM TOTAL: ₹${costs.total.toLocaleString('en-IN')}${' '.repeat(Math.max(0, 44 - String(costs.total.toLocaleString('en-IN')).length))}│\n`;
            content += `└─────────────────────────────────────────────────────────┘\n\n`;
        });
        
        content += `╔═══════════════════════════════════════════════════════════╗\n`;
        content += `║ PROJECT SUMMARY                                          ║\n`;
        content += `╠═══════════════════════════════════════════════════════════╣\n`;
        content += `║ Total Wall Area      : ${totalWallArea.toFixed(2)} sq ft${' '.repeat(Math.max(0, 25 - String(totalWallArea.toFixed(2)).length))}║\n`;
        content += `║ Total Ceiling Area   : ${totalCeilingArea.toFixed(2)} sq ft${' '.repeat(Math.max(0, 25 - String(totalCeilingArea.toFixed(2)).length))}║\n`;
        content += `║ Total Floor Area     : ${totalFloorArea.toFixed(2)} sq ft${' '.repeat(Math.max(0, 25 - String(totalFloorArea.toFixed(2)).length))}║\n`;
        if (totalAdditionalArea > 0) {
            content += `║ Total Additional Area: ${totalAdditionalArea.toFixed(2)} sq ft${' '.repeat(Math.max(0, 25 - String(totalAdditionalArea.toFixed(2)).length))}║\n`;
        }
        if (totalDoors > 0) {
            content += `║ Total Acoustic Doors : ${totalDoors} units${' '.repeat(Math.max(0, 31 - String(totalDoors).length))}║\n`;
        }
        content += `╠═══════════════════════════════════════════════════════════╣\n`;
        content += `║                                                          ║\n`;
        content += `║         ★★★ TOTAL PROJECT COST: ₹${totalProjectCost.toLocaleString('en-IN')} ★★★${' '.repeat(Math.max(0, 11 - String(totalProjectCost.toLocaleString('en-IN')).length))}║\n`;
        content += `║                                                          ║\n`;
        content += `╚═══════════════════════════════════════════════════════════╝\n\n`;
        
        if (this.projectData.notes) {
            content += `┌─────────────────────────────────────────────────────────┐\n`;
            content += `│ PROJECT NOTES:                                          │\n`;
            content += `├─────────────────────────────────────────────────────────┤\n`;
            content += `│ ${this.projectData.notes.padEnd(56)}│\n`;
            content += `└─────────────────────────────────────────────────────────┘\n\n`;
        }
        
        content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        content += `Generated with DIGICAL Pro | Powered by Digi Acoustics\n`;
        content += `Date: ${now.toLocaleDateString('en-IN', dateOptions)}\n`;
        content += `Time: ${now.toLocaleTimeString('en-IN', timeOptions)}\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        
        return content;
    }

    shareQuotation() {
        const quotationContent = this.generateQuotationContent();
        
        if (navigator.share) {
            navigator.share({
                title: 'DIGICAL Pro - Quotation',
                text: quotationContent
            });
        } else {
            navigator.clipboard.writeText(quotationContent).then(() => {
                this.showMessage('Quotation copied to clipboard!', 'success');
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = quotationContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showMessage('Quotation copied to clipboard!', 'success');
            });
        }
    }

    generateQuotationContent() {
        this.saveCurrentRoomData();
        
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        
        let content = `╔═══════════════════════════════════════════════════════════╗\n`;
        content += `║                  PRICE QUOTATION                         ║\n`;
        content += `║              Digi Acoustics                              ║\n`;
        content += `╚═══════════════════════════════════════════════════════════╝\n\n`;
        
        content += `Date: ${now.toLocaleDateString('en-IN', dateOptions)}\n\n`;
        content += `To,\n${this.projectData.client || '[Client Name]'}\n`;
        content += `${this.projectData.location || '[Location]'}\n\n`;
        content += `Subject: Quotation for ${this.projectData.name || 'Acoustic Work'}\n\n`;
        content += `Dear Sir/Madam,\n\n`;
        content += `We are pleased to submit our quotation for the acoustic work\nas per your requirement:\n\n`;
        
        content += `┌─────────────────────────────────────────────────────────┐\n`;
        content += `│ QUOTATION DETAILS                                       │\n`;
        content += `└─────────────────────────────────────────────────────────┘\n\n`;
        
        let totalProjectCost = 0;
        let srNo = 1;
        
        this.rooms.forEach((room, index) => {
            const areas = this.calculateRoomAreas(room);
            const costs = this.calculatePricing(areas, room.pricing);
            totalProjectCost += costs.total;
            
            content += `${srNo}. ${room.name}\n`;
            content += `   ${'-'.repeat(55)}\n`;
            
            if (costs.wall > 0) {
                content += `   Wall Area Treatment\n`;
                content += `   ${areas.walls.net.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.wallPrice) || 0}/sq ft = ₹${costs.wall.toLocaleString('en-IN')}\n\n`;
                srNo++;
            }
            
            if (costs.ceiling > 0) {
                content += `${srNo}. ${room.name} - Ceiling\n`;
                content += `   ${'-'.repeat(55)}\n`;
                content += `   Ceiling Area Treatment\n`;
                content += `   ${areas.ceiling.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.ceilingPrice) || 0}/sq ft = ₹${costs.ceiling.toLocaleString('en-IN')}\n\n`;
                srNo++;
            }
            
            if (costs.floor > 0) {
                content += `${srNo}. ${room.name} - Floor\n`;
                content += `   ${'-'.repeat(55)}\n`;
                content += `   Floor Area Treatment\n`;
                content += `   ${areas.floor.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.floorPrice) || 0}/sq ft = ₹${costs.floor.toLocaleString('en-IN')}\n\n`;
                srNo++;
            }
            
            if (costs.doors > 0) {
                content += `${srNo}. Acoustic Doors - ${room.name}\n`;
                content += `   ${'-'.repeat(55)}\n`;
                content += `   ${areas.acousticDoors} units × ₹${parseFloat(room.pricing.doorPrice) || 0}/unit = ₹${costs.doors.toLocaleString('en-IN')}\n\n`;
                srNo++;
            }
            
            if (costs.additional > 0) {
                content += `${srNo}. Additional Areas - ${room.name}\n`;
                content += `   ${'-'.repeat(55)}\n`;
                content += `   ${areas.additional.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.additionalPrice) || 0}/sq ft = ₹${costs.additional.toLocaleString('en-IN')}\n\n`;
                srNo++;
            }
        });
        
        content += `${'='.repeat(59)}\n`;
        content += `TOTAL PROJECT COST: ₹${totalProjectCost.toLocaleString('en-IN')}\n`;
        content += `${'='.repeat(59)}\n\n`;
        
        content += `Terms & Conditions:\n`;
        content += `• Payment Terms: [As per agreement]\n`;
        content += `• Validity: 30 days from quotation date\n`;
        content += `• GST: As applicable\n\n`;
        
        content += `We look forward to your positive response.\n\n`;
        content += `Thank you,\n`;
        content += `Digi Acoustics\n\n`;
        
        content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        content += `Generated with DIGICAL Pro | Powered by Digi Acoustics\n`;
        content += `${now.toLocaleDateString('en-IN', dateOptions)}\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        
        return content;
    }

    resetAll() {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            this.rooms = [];
            this.currentRoomIndex = 0;
            this.projectData = { name: '', client: '', location: '', notes: '' };
            
            document.getElementById('projectName').value = '';
            document.getElementById('clientName').value = '';
            document.getElementById('location').value = '';
            document.getElementById('roomResults').innerHTML = '';
            document.getElementById('projectSummary').innerHTML = '';
            
            this.addRoom();
            this.showMessage('All data has been reset!', 'success');
        }
    }

    takeScreenshot() {
        const element = document.getElementById('app-container');
        
        html2canvas(element, {
            allowTaint: true,
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            width: element.scrollWidth,
            height: element.scrollHeight
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `${this.projectData.name || 'DIGICAL_Pro'}_${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL();
            link.click();
            this.showMessage('Screenshot saved!', 'success');
        }).catch(error => {
            console.error('Screenshot failed:', error);
            this.showMessage('Screenshot failed. Please try again.', 'error');
        });
    }

    exportPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const primaryColor = [84, 3, 30];
            const secondaryColor = [125, 21, 56];
            const accentColor = [40, 167, 69];
            const warningColor = [255, 193, 7];
            const infoColor = [23, 162, 184];
            
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, 210, 35, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont(undefined, 'bold');
            doc.text('DIGICAL Pro Report', 20, 22);
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text('Powered by Digi Acoustics', 20, 30);
            
            let yPosition = 50;
            
            doc.setFillColor(...secondaryColor);
            doc.rect(15, yPosition - 5, 180, 30, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('PROJECT INFORMATION', 20, yPosition + 5);
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            yPosition += 12;
            doc.text(`Project: ${this.projectData.name || 'Untitled'}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Client: ${this.projectData.client || 'N/A'}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Location: ${this.projectData.location || 'N/A'}`, 20, yPosition);
            yPosition += 15;
            
            let totalCost = 0;
            this.rooms.forEach((room, index) => {
                const areas = this.calculateRoomAreas(room);
                const costs = this.calculatePricing(areas, room.pricing);
                totalCost += costs.total;
                
                if (yPosition > 240) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                doc.setFillColor(...accentColor);
                doc.rect(15, yPosition - 3, 180, 12, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text(`${room.name} - ${parseFloat(room.length) || 0}' × ${parseFloat(room.width) || 0}' × ${parseFloat(room.height) || 0}'`, 20, yPosition + 5);
                yPosition += 18;
                
                doc.setFillColor(...infoColor);
                doc.rect(15, yPosition - 3, 180, 25, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text('AREA CALCULATIONS:', 20, yPosition + 3);
                doc.setFont(undefined, 'normal');
                yPosition += 8;
                doc.text(`Net Wall Area: ${areas.walls.net.toFixed(2)} sq ft`, 20, yPosition);
                yPosition += 5;
                doc.text(`Ceiling Area: ${areas.ceiling.toFixed(2)} sq ft`, 20, yPosition);
                yPosition += 5;
                doc.text(`Floor Area: ${areas.floor.toFixed(2)} sq ft`, 20, yPosition);
                if (areas.additional > 0) {
                    yPosition += 5;
                    doc.text(`Additional Areas: ${areas.additional.toFixed(2)} sq ft`, 20, yPosition);
                }
                if (areas.acousticDoors > 0) {
                    yPosition += 5;
                    doc.text(`Acoustic Doors: ${areas.acousticDoors} units`, 20, yPosition);
                }
                yPosition += 12;
                
                doc.setFillColor(...warningColor);
                doc.rect(15, yPosition - 3, 180, 25, 'F');
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text('DETAILED PRICING:', 20, yPosition + 3);
                doc.setFont(undefined, 'normal');
                yPosition += 8;
                
                if (costs.wall > 0) {
                    doc.text(`Wall: ${areas.walls.net.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.wallPrice) || 0} = ₹${costs.wall.toLocaleString('en-IN')}`, 20, yPosition);
                    yPosition += 5;
                }
                if (costs.ceiling > 0) {
                    doc.text(`Ceiling: ${areas.ceiling.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.ceilingPrice) || 0} = ₹${costs.ceiling.toLocaleString('en-IN')}`, 20, yPosition);
                    yPosition += 5;
                }
                if (costs.floor > 0) {
                    doc.text(`Floor: ${areas.floor.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.floorPrice) || 0} = ₹${costs.floor.toLocaleString('en-IN')}`, 20, yPosition);
                    yPosition += 5;
                }
                if (costs.doors > 0) {
                    doc.text(`Doors: ${areas.acousticDoors} units × ₹${parseFloat(room.pricing.doorPrice) || 0} = ₹${costs.doors.toLocaleString('en-IN')}`, 20, yPosition);
                    yPosition += 5;
                }
                if (costs.additional > 0) {
                    doc.text(`Additional: ${areas.additional.toFixed(2)} sq ft × ₹${parseFloat(room.pricing.additionalPrice) || 0} = ₹${costs.additional.toLocaleString('en-IN')}`, 20, yPosition);
                    yPosition += 5;
                }
                
                doc.setFont(undefined, 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text(`ROOM TOTAL: ₹${costs.total.toLocaleString('en-IN')}`, 20, yPosition + 5);
                yPosition += 20;
            });
            
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFillColor(...primaryColor);
            doc.rect(15, yPosition - 5, 180, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text(`TOTAL PROJECT COST: ₹${totalCost.toLocaleString('en-IN')}`, 20, yPosition + 8);
            yPosition += 25;
            
            const footerY = doc.internal.pageSize.height - 25;
            doc.setFillColor(...secondaryColor);
            doc.rect(0, footerY, 210, 25, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text('Generated with DIGICAL Pro', 20, footerY + 8);
            doc.setFont(undefined, 'normal');
            doc.text('Powered by Digi Acoustics', 20, footerY + 14);
            
            const now = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
            doc.text(`Generated on: ${now.toLocaleDateString('en-IN', options)}`, 20, footerY + 20);
            
            doc.save(`${this.projectData.name || 'DIGICAL_Pro'}_DetailedReport.pdf`);
            this.showMessage('Enhanced PDF exported successfully!', 'success');
        } catch (error) {
            console.error('PDF export failed:', error);
            this.showMessage('PDF export failed. Please try again.', 'error');
        }
    }

    showMessage(text, type) {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 3000);
    }
}

const app = new DigicalPro();

function addRoom() { app.addRoom(); }
function calculateAll() { app.calculateAll(); }
function saveProject() { app.saveProject(); }
function loadProject() { app.loadProject(); }
function toggleNotes() { app.toggleNotes(); }
function saveNotes() { app.saveNotes(); }
function closeNotes() { app.closeNotes(); }
function shareResults() { app.shareResults(); }
function shareQuotation() { app.shareQuotation(); }
function resetAll() { app.resetAll(); }
function takeScreenshot() { app.takeScreenshot(); }
function exportPDF() { app.exportPDF(); }
function closeLoadModal() { app.closeLoadModal(); }
function deleteSavedProject(index) { app.deleteSavedProject(index); }
function toggleDataModal() { app.toggleDataModal(); }
function closeDataModal() { app.closeDataModal(); }
function exportAllProjects() { app.exportAllProjects(); }
function importProjects(event) { app.importProjects(event); }
