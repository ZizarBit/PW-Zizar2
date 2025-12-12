const API_URL = 'http://localhost:5500/api';

// Verificar autenticación
function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    if (currentPage === 'crud.html' && !isLoggedIn) {
        window.location.href = 'login.html';
    } else if (currentPage === 'login.html' && isLoggedIn) {
        window.location.href = 'crud.html';
    }
}

// Mostrar mensaje
function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = isError ? 'error-message show' : 'form-message success';
        element.style.display = 'block';

        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
}

// Formatear salario
function formatSalary(salary) {
    if (!salary) return 'N/A';
    return '$' + parseFloat(salary).toLocaleString('es-MX', { minimumFractionDigits: 2 });
}

//Login HTML

if (document.getElementById('loginForm')) {
    checkAuth();

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userName', data.user.name);
                sessionStorage.setItem('userEmail', data.user.email);
                window.location.href = 'crud.html';
            } else {
                showMessage('errorMessage', data.error || 'Error al iniciar sesión', true);
            }
        } catch (error) {
            showMessage('errorMessage', 'Error de conexión con el servidor', true);
            console.error('Error:', error);
        }
    });
}

//CRUD html

if (document.getElementById('employeeForm')) {
    checkAuth();

    // Variables globales
    let allEmployees = [];
    let editingMode = false;

    // Mostrar nombre de usuario
    const userName = sessionStorage.getItem('userName');
    if (userName) {
        document.getElementById('userName').textContent = `Bienvenido, ${userName}`;
    }

    // Cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    // Cargar departamentos
    async function loadDepartments() {
        try {
            const response = await fetch(`${API_URL}/departamentos`);
            const departments = await response.json();

            const select = document.getElementById('dno');
            select.innerHTML = '<option value="">Seleccionar departamento</option>';

            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.Dnumber;
                option.textContent = dept.Dname;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar departamentos:', error);
        }
    }

    // Cargar empleados
    async function loadEmployees() {
        try {
            const tbody = document.getElementById('employeesTableBody');
            tbody.innerHTML = '<tr><td colspan="7" class="loading">Cargando empleados...</td></tr>';

            const response = await fetch(`${API_URL}/empleados`);
            allEmployees = await response.json();

            displayEmployees(allEmployees);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            const tbody = document.getElementById('employeesTableBody');
            tbody.innerHTML = '<tr><td colspan="7" class="loading">Error al cargar empleados</td></tr>';
        }
    }

    // Mostrar empleados en la tabla
    function displayEmployees(employees) {
        const tbody = document.getElementById('employeesTableBody');

        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay empleados registrados</td></tr>';
            return;
        }

        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>${emp.Ssn}</td>
                <td>${emp.Fname} ${emp.Minit || ''} ${emp.Lname}</td>
                <td>${formatDate(emp.Bdate)}</td>
                <td>${emp.Sex || 'N/A'}</td>
                <td>${formatSalary(emp.Salary)}</td>
                <td>${emp.DepartmentName || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editEmployee('${emp.Ssn}')">Editar</button>
                        <button class="btn-delete" onclick="deleteEmployee('${emp.Ssn}')">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Buscar empleados
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = allEmployees.filter(emp =>
            emp.Fname.toLowerCase().includes(searchTerm) ||
            emp.Lname.toLowerCase().includes(searchTerm) ||
            emp.Ssn.includes(searchTerm)
        );
        displayEmployees(filtered);
    });

    // Actualizar tabla
    document.getElementById('refreshBtn').addEventListener('click', loadEmployees);

    // Enviar formulario (Crear/Actualizar)
    document.getElementById('employeeForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            Fname: document.getElementById('fname').value,
            Minit: document.getElementById('minit').value || null,
            Lname: document.getElementById('lname').value,
            Ssn: document.getElementById('ssn').value,
            Bdate: document.getElementById('bdate').value || null,
            Address: document.getElementById('address').value || null,
            Sex: document.getElementById('sex').value || null,
            Salary: document.getElementById('salary').value || null,
            Super_ssn: document.getElementById('superSsn').value || null,
            Dno: parseInt(document.getElementById('dno').value)
        };

        try {
            let response;
            if (editingMode) {
                const originalSsn = document.getElementById('originalSsn').value;
                response = await fetch(`${API_URL}/empleados/${originalSsn}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`${API_URL}/empleados`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            const data = await response.json();

            if (response.ok) {
                showMessage('formMessage', data.message, false);
                document.getElementById('employeeForm').reset();
                cancelEdit();
                loadEmployees();
            } else {
                showMessage('formMessage', data.error || 'Error al guardar empleado', true);
            }
        } catch (error) {
            showMessage('formMessage', 'Error de conexión con el servidor', true);
            console.error('Error:', error);
        }
    });

    // Editar empleado
    window.editEmployee = async function(ssn) {
        try {
            const response = await fetch(`${API_URL}/empleados/${ssn}`);
            const emp = await response.json();

            document.getElementById('formTitle').textContent = 'Editar Empleado';
            document.getElementById('submitBtn').textContent = 'Actualizar Empleado';
            document.getElementById('originalSsn').value = ssn;

            document.getElementById('fname').value = emp.Fname;
            document.getElementById('minit').value = emp.Minit || '';
            document.getElementById('lname').value = emp.Lname;
            document.getElementById('ssn').value = emp.Ssn;
            document.getElementById('bdate').value = emp.Bdate ? emp.Bdate.split('T')[0] : '';
            document.getElementById('address').value = emp.Address || '';
            document.getElementById('sex').value = emp.Sex || '';
            document.getElementById('salary').value = emp.Salary || '';
            document.getElementById('superSsn').value = emp.Super_ssn || '';
            document.getElementById('dno').value = emp.Dno;

            document.getElementById('ssn').disabled = true;
            document.getElementById('cancelBtn').style.display = 'block';
            editingMode = true;

            // Scroll al formulario
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error al cargar empleado:', error);
        }
    };

    // Eliminar empleado
    window.deleteEmployee = async function(ssn) {
        if (!confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/empleados/${ssn}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                loadEmployees();
            } else {
                alert(data.error || 'Error al eliminar empleado');
            }
        } catch (error) {
            alert('Error de conexión con el servidor');
            console.error('Error:', error);
        }
    };

    // Cancelar edición
    function cancelEdit() {
        document.getElementById('formTitle').textContent = 'Agregar Nuevo Empleado';
        document.getElementById('submitBtn').textContent = 'Agregar Empleado';
        document.getElementById('originalSsn').value = '';
        document.getElementById('ssn').disabled = false;
        document.getElementById('cancelBtn').style.display = 'none';
        editingMode = false;
    }

    document.getElementById('cancelBtn').addEventListener('click', () => {
        document.getElementById('employeeForm').reset();
        cancelEdit();
    });

    // Inicializar
    loadDepartments();
    loadEmployees();
}