let expenses = [];
let editId = null;
let expenseChart = null;
let categories = [
    "Electricity",
    "Gas",
    "Internet",
    "Food",
    "Rent",
    "Other"
];
let trendChart;
let chart;

function saveCategories(){

    localStorage.setItem(
        "categories",
        JSON.stringify(categories)
    );
}

async function addExpense() {

    const title =
        document.getElementById("title").value;

    const amount =
        document.getElementById("amount").value;

    const category =
        document.getElementById("category").value;

    const date =
        document.getElementById("date").value;

    const file =
        document.getElementById("billPhoto").files[0];

    if (
        !title ||
        !amount ||
        !category ||
        !date
    ) {
        alert("Please fill all fields");
        return;
    }

    let imageData = "";

    if (file) {
        imageData = await getBase64(file);
    }

    // EDIT MODE
    if(editId){

        const expense =
            expenses.find(
                expense => expense.id === editId
            );

        expense.title = title;
        expense.amount = Number(amount);
        expense.category = category;
        expense.date = date;

        await updateExpenseInSheet(expense);

        saveExpenses();

        renderExpenses();

        clearForm();

        editId = null;

        return;
    }

    // ADD NEW
    const expense = {
        id: Date.now(),
        title,
        amount: Number(amount),
        category,
        date,
        image: imageData
    };

    await saveExpenseToSheet(expense);

    expenses.push(expense);

    saveExpenses();

    renderExpenses();

    clearForm();
}

function renderExpenses() {

    const table =
        document.getElementById("expenseTable");

    const dashboard =
        document.getElementById("dashboard");

    const searchText =
        document.getElementById("searchInput")
            ?.value
            .toLowerCase() || "";

    const selectedMonth =
        document.getElementById("monthFilter")
            ?.value || "";

    table.innerHTML = "";
    dashboard.innerHTML = "";

    let total = 0;
    let billCount = 0;
    const categoryTotals = {};

    const filteredExpenses = expenses.filter(expense => {

    if(
        searchText &&
        !expense.title.toLowerCase().includes(searchText)
    ){
        return false;
    }

    if(
        selectedMonth &&
        !expense.date.startsWith(selectedMonth)
    ){
        return false;
    }

    return true;
    });

    filteredExpenses.forEach(expense => {


        total += expense.amount;
        billCount++;

        if(categoryTotals[expense.category]){
            categoryTotals[expense.category] += expense.amount;
        }else{
            categoryTotals[expense.category] = expense.amount;
        }

        table.innerHTML += `
            <tr>
                <td>${expense.title}</td>
                <td>₹${expense.amount}</td>
                <td>${expense.category}</td>
                <td>${expense.date}</td>
                <td>
                    ${
                        expense.image
                        ? `<button onclick="viewImage('${expense.image}')">
                            View
                           </button>`
                        : "No Image"
                    }
                </td>
                
                <td>
                    <button
                        onclick="editExpense(${expense.id})">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteExpense(${expense.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });

    dashboard.innerHTML += `
        <div class="card">
            <h3>Total Bills</h3>
            <p>${filteredExpenses.length}</p>
        </div>
        `;
    dashboard.innerHTML += `
        <div class="card">
            <h3>Total Expenses</h3>
            <p>₹${total}</p>
        </div>
    `;

    for(const category in categoryTotals){

        dashboard.innerHTML += `
            <div class="card">
                <h3>${category}</h3>
                <p>₹${categoryTotals[category]}</p>
            </div>
        `;
    }

    const totalAmountElement =
    document.getElementById("totalAmount");

    document.getElementById(
    "filteredBills"
        ).innerText =
            filteredExpenses.length;

        document.getElementById(
            "filteredAmount"
        ).innerText =
            `₹${total}`;

    if(totalAmountElement){
        totalAmountElement.innerText = total;
    }
    renderChart(categoryTotals);
   
    renderTrendChart(
    filteredExpenses
            );

    
}

async function deleteExpense(id){

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this expense?"
        );

    if(!confirmDelete){
        return;
    }

    await deleteExpenseFromSheet(id);

    expenses =
        expenses.filter(
        expense => expense.id !== id
    );

    saveExpenses();

    renderExpenses();
}

function clearForm(){

    document.getElementById("title").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("date").value = "";
    document.getElementById("billPhoto").value = "";
}

function saveExpenses() {
    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );
}

const storedExpenses =
    localStorage.getItem("expenses");

if (storedExpenses) {
    expenses = JSON.parse(storedExpenses);
    renderExpenses();
}

function getBase64(file) {
    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () =>
            resolve(reader.result);

        reader.onerror = error =>
            reject(error);
    });
}

function viewImage(image){

    window.open(
        image,
        "_blank"
    );
}

function editExpense(id){

    const expense =
        expenses.find(
            e => e.id === id
        );

    if(!expense){
        return;
    }

    document.getElementById(
        "editId"
    ).value =
        expense.id;
    document.getElementById(
        "editCategory"
    ).innerHTML =
        document.getElementById(
            "category"
        ).innerHTML;
    document.getElementById(
        "editTitle"
    ).value =
        expense.title;

    document.getElementById(
        "editAmount"
    ).value =
        expense.amount;

    document.getElementById(
        "editCategory"
    ).value =
        expense.category;

    document.getElementById(
        "editDate"
    ).value =
        expense.date;

    document.getElementById(
        "editModal"
    ).style.display =
        "block";
}
function closeModal(){

    document.getElementById(
        "editModal"
    ).style.display =
        "none";
}

async function saveEdit(){

    const id =
        Number(
            document.getElementById(
                "editId"
            ).value
        );

    const expense =
        expenses.find(
            e => e.id === id
        );

    if(!expense){
        return;
    }

    expense.title =
        document.getElementById(
            "editTitle"
        ).value;

    expense.amount =
        Number(
            document.getElementById(
                "editAmount"
            ).value
        );

    expense.category =
        document.getElementById(
            "editCategory"
        ).value;

    expense.date =
        document.getElementById(
            "editDate"
        ).value;

    await updateExpenseInSheet(
        expense
    );

    saveExpenses();

    renderExpenses();

    closeModal();
}

function renderChart(categoryTotals){

    const ctx =
        document.getElementById("expenseChart");

    if(!ctx){
        return;
    }

    if(expenseChart){
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: Object.keys(categoryTotals),

            datasets: [{
                data: Object.values(categoryTotals)
            }]
        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    position: "bottom"
                }
            }
        }
    });
}
function renderTrendChart(filteredExpenses){

    const monthlyTotals = {};

    expenses.forEach(expense => {

        const month =
            expense.date.substring(0, 7);

        monthlyTotals[month] =
            (monthlyTotals[month] || 0)
            + expense.amount;
    });

    const labels =
        Object.keys(monthlyTotals).sort();

    const values =
        labels.map(
            month => monthlyTotals[month]
        );

    const canvas =
        document.getElementById(
            "trendChart"
        );

    if(!canvas){
        return;
    }

    const ctx =
        canvas.getContext("2d");

    if(trendChart){
        trendChart.destroy();
    }

    trendChart =
        new Chart(ctx, {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {
                        type: "bar",

                        label: "Expenses",

                        data: values,

                        borderRadius: 8
                    },

                    {
                        type: "line",

                        label: "Trend",

                        data: values,

                        tension: 0.4,

                        fill: false,

                        pointRadius: 5
                    }

                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    x: {

                        offset: false,

                        grid: {
                            display: false
                        }

                    },

                    y: {

                        beginAtZero: true,

                        grid: {
                            display: false
                        }

                    }

                }

            }
        });
}


function exportCSV() {

    const rows = [
        ["Title","Amount","Category","Date"]
    ];

    expenses.forEach(expense => {

        rows.push([
            expense.title,
            expense.amount,
            expense.category,
            expense.date
        ]);
    });

    const csv =
        rows.map(
            row => row.join(",")
        ).join("\n");

    const blob =
        new Blob([csv], {
            type: "text/csv"
        });

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download = "expenses.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

function renderCategories(){

    const categorySelect =
        document.getElementById("category");

    categorySelect.innerHTML =
        '<option value="">Select Category</option>';

    categories.forEach(category => {

        categorySelect.innerHTML += `
            <option value="${category}">
                ${category}
            </option>
        `;
    });

    const deleteSelect =
        document.getElementById("categoryDelete");

    if(deleteSelect){

        deleteSelect.innerHTML = "";

        categories.forEach(category => {

            deleteSelect.innerHTML += `
                <option value="${category}">
                    ${category}
                </option>
            `;
        });
    }
}

function addCategory(){

    const input =
        document.getElementById("categoryInput");

    const category =
        input.value.trim();

    if(!category){
        alert("Enter category name");
        return;
    }

    if(categories.includes(category)){
        alert("Category already exists");
        return;
    }

    categories.push(category);

    saveCategories();

    renderCategories();

    input.value = "";
}

function deleteCategory(){

    const category =
        document.getElementById("categoryDelete").value;

    const used =
        expenses.some(
            expense => expense.category === category
        );

    if(used){
        alert(
            "Cannot delete category because expenses use it."
        );
        return;
    }

    categories =
        categories.filter(
            c => c !== category
        );

    saveCategories();

    renderCategories();
    
}

const storedCategories =
    localStorage.getItem("categories");

if(storedCategories){
    categories = JSON.parse(storedCategories);
}

renderCategories();

loadExpensesFromSheet();



function toggleTheme(){

    document.body.classList.toggle(
        "dark-mode"
    );

    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );

    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );
}

const savedTheme =
    localStorage.getItem("theme");

if(savedTheme === "dark"){

    document.body.classList.add(
        "dark-mode"
    );

    document.getElementById(
        "themeSwitch"
    ).checked = true;
}

function exportPDF(){

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    const selectedMonth =
        document.getElementById(
            "monthFilter"
        ).value;

    const filteredExpenses =
        expenses.filter(expense => {

            if(
                selectedMonth &&
                !expense.date.startsWith(
                    selectedMonth
                )
            ){
                return false;
            }

            return true;
        });

    let total = 0;

    const categoryTotals = {};

    filteredExpenses.forEach(expense => {

        total += expense.amount;

        if(categoryTotals[expense.category]){
            categoryTotals[expense.category] += expense.amount;
        }else{
            categoryTotals[expense.category] = expense.amount;
        }
    });

    let highestCategory = "-";
    let highestAmount = 0;

    for(const category in categoryTotals){

        if(categoryTotals[category] > highestAmount){

            highestAmount =
                categoryTotals[category];

            highestCategory =
                category;
        }
    }

    const average =
        filteredExpenses.length > 0
        ?
        Math.round(
            total / filteredExpenses.length
        )
        :
        0;

    // HEADER

    doc.setFontSize(20);

    doc.text(
        "Expense Report",
        14,
        20
    );

    doc.setFontSize(11);

    doc.text(
        selectedMonth
        ?
        `Month: ${selectedMonth}`
        :
        "All Expenses",
        14,
        30
    );

    // SUMMARY SECTION
        function drawCard(
            x,
            y,
            title,
            value
        ){

            doc.setFillColor(
                232,
                245,
                233
            );

            doc.roundedRect(
                x,
                y,
                42,
                25,
                3,
                3,
                "F"
            );

            doc.setFontSize(9);

            doc.setTextColor(
                100
            );

            doc.text(
                title,
                x + 4,
                y + 8
            );

            doc.setFontSize(13);

            doc.setTextColor(
                46,
                125,
                50
            );

            doc.text(
                String(value),
                x + 4,
                y + 18
            );
        }

        
        drawCard(
            14,
            45,
            "Bills",
            filteredExpenses.length
        );

        drawCard(
            60,
            45,
            "Expense",
            `Rs. ${total}`
        );

        drawCard(
            14,
            75,
            "Category",
            highestCategory
        );

        drawCard(
            60,
            75,
            "Average",
            `Rs. ${average}`
        );
 
    if(chart){
        chart.update();
    }

    if(trendChart){
        trendChart.update();
    }

    const pieCanvas =
        document.getElementById(
            "expenseChart"
        );

    const trendCanvas =
        document.getElementById(
            "trendChart"
        );

    let pieImage = null;
    let trendImage = null;

    try{

        pieImage =
            pieCanvas.toDataURL(
                "image/png"
            );

    }catch(err){

        console.log(
            "Pie Error:",
            err
        );
    }

    try{

        trendImage =
            trendCanvas.toDataURL(
                "image/png"
            );

    }catch(err){

        console.log(
            "Trend Error:",
            err
        );
    }

    if(pieImage){

        doc.addImage(
            pieImage,
            "PNG",
            120,
            25,
            70,
            50
        );
    }

    if(trendImage){

        doc.addImage(
            trendImage,
            "PNG",
            15,
            110,
            180,
            55
        );
    }

    const rows = [];

    filteredExpenses.forEach(expense => {

        rows.push([
            expense.title,
            `Rs. ${expense.amount}`,
            expense.category,
            expense.date
        ]);

    });

    doc.autoTable({

        startY: 175,

        head: [[
            "Title",
            "Amount",
            "Category",
            "Date"
        ]],

        body: rows

    });

    doc.setFontSize(10);

    doc.text(

        `Generated On: ${
            new Date()
            .toLocaleString()
        }`,

        14,

        doc.lastAutoTable.finalY + 15

    );

    doc.save(

        selectedMonth
        ?
        `Expense-Report-${selectedMonth}.pdf`
        :
        "Expense-Report.pdf"

    );


}


function showTab(tabId, button){

    document
        .querySelectorAll(".tab-content")
        .forEach(tab => {

            tab.style.display = "none";
        });

    document
        .querySelectorAll(".tab-btn")
        .forEach(btn => {

            btn.classList.remove("active");
        });

    document
        .getElementById(tabId)
        .style.display = "block";

    button.classList.add("active");
}

document.getElementById("date").value =
    new Date()
        .toISOString()
        .split("T")[0];

document.getElementById("monthFilter").value =
    new Date()
        .toISOString()
        .slice(0, 7);


function changeTheme(){

    const selectedTheme =
        document.getElementById(
            "themeSelector"
        ).value;

    document.getElementById(
        "themeStylesheet"
    ).href = selectedTheme;

    localStorage.setItem(
        "selectedTheme",
        selectedTheme
    );
}

window.addEventListener(
    "DOMContentLoaded",
    () => {

        const savedTheme =
            localStorage.getItem(
                "selectedTheme"
            );

        if(savedTheme){

            document.getElementById(
                "themeStylesheet"
            ).href = savedTheme;

            const selector =
                document.getElementById(
                    "themeSelector"
                );

            if(selector){
                selector.value =
                    savedTheme;
            }
        }
    }
);