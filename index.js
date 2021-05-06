// Dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
const table = require("console.table");

require("dotenv").config();

// Other Stuff
let existingRoles = new Array();
let existingManagers = new Array();
let existingEmployees = new Array();
let existingDepartments = new Array();

// Inquirer Prompts
const initalPrompt = {
  type: "list",
  name: "firstResponse",
  message: "What Would You Like To Do?",
  choices: [
    "View All Employees",
    "View Employees By Department",
    "View Employees By Manager",
    "Add an Employee",
    "Remove an Employee",
    "Add a Role",
    "Remove a Role",
    "Add a Department",
    "Remove a Department",
    `Update an Employee's Role`,
    `Update an Employee's Manager`,
    "Exit",
  ],
};

const viewDeptPrompt = [
    {
        type: "list",
        name: "chooseDept",
        message: "Please select a department",
        choices: existingDepartments
    }
]

const viewManagerPrompt = [
    {
        type: "list",
        name: "chooseManager",
        message: "Please select a manager",
        choices: existingManagers
    }
]

const updateRolePrompt = [
  {
    type: "list",
    name: "updateRole",
    message: "Which employee would you like to update the role for?",
    choices: existingEmployees
  }];

const addEmployeeNamePrompts = [
  {
    type: "input",
    name: "firstName",
    message: "What is the employee's first name?",
  },
  {
    type: "input",
    name: "lastName",
    message: "What is the employee's last name?",
  },
];

const newRolePrompt = [
  {
    type: "input",
    name: "newRole",
    message: `What is the employee's role?`,
  },
  {
    type: "Number",
    name: "salary",
    message: "What is the employee's annual salary?",
  },
  {
    type: "input",
    name: "departmentID",
    message: `What is the department ID for this employee's role?`,
  },
];

const removeRolePrompt = {
  type: "list",
  name: "removedRole",
  message: "Which role would you like to remove?",
  choices: existingRoles,
};

const existingRolePrompt = {
  type: "list",
  name: "existingRole",
  message: `What is the employee's role?`,
  choices: existingRoles,
};

const removedEmployeePrompt = {
  type: "list",
  name: "removedEmployee",
  message: "Select the employee to remove",
  choices: existingEmployees,
};

const addDepartmentPrompt = {
  type: "input",
  name: "addDepartment",
  message: "What is the name of the new department you would like to add?",
};

const removeDepartmentPrompt = {
  type: "list",
  name: "removedDepartment",
  message: "Which department would you like to remove?",
  choices: existingDepartments,
};

const selectManager = {
  type: "list",
  name: "selectManager",
  message: `Please select this employee's direct manager.`,
  choices: existingManagers,
};

// DB Connection
const connection = mysql.createConnection({
  host: "localhost",
  // Local Host Port
  port: 3306,
  // Username
  user: process.env.DB_USER,
  // Password: Password is Hidden in Ignored JSON
  password: process.env.DB_PASS,
  // Database
  database: process.env.DB_NAME,
});

// Connect to the DB
connection.connect((err) => {
  err ? console.error(err) : console.log("Connected to Database");
  init();
});

// Functions
const endConnection = () => {
  inquirer
    .prompt({
      type: "list",
      name: "exit",
      message: "Are you sure you want to exit?",
      choices: ["Yes", "No"],
    })
    .then((exitResult) => {
      if (exitResult.exit == "Yes") {
        connection.end();
      } else if (exitResult.exit == "No") {
        return init();
      }
    });
};

const init = () => {
  inquirer.prompt(initalPrompt).then((initalPrompt) => {
    switchCases(initalPrompt.firstResponse);
    // endConnection(); // end connection, remove before deploying
  });
};

const switchCases = (responses) => {
  switch (responses) {
    case "View All Employees":
      viewAllEmployees();
      break;
    case "View Employees By Department":
      viewByDepartment();
      break;
    case "View Employees By Manager":
      viewByManager();
      break;
    case "Add an Employee":
      addEmployeeName();
      break;
    case "Remove an Employee":
      removeEmployee();
      break;
    case "Add a Role":
      addRole();
      break;
    case "Remove a Role":
      removeRole();
      break;
    case "Add a Department":
      createDepartment();
      console.log("Add a Department");
      break;
    case "Remove a Department":
      removeDepartment();
      break;
    case `Update an Employee's Role`:
      updateEmployeeRole();
      break;
    case `Update an Emplyoee's Manager`:
      updateEmployeeManager();
      break;
    case `Exit`:
      endConnection();
      break;
  }
};

const viewAllEmployees = () => {
  connection.query(
    `SELECT Employees.Employee_ID, Employees.First_Name, Employees.Last_Name, Managers.First_Name AS Manager_First_Name, Managers.Last_Name AS Manager_Last_Name, Roles.Title AS Role, Departments.Department_Name AS Department FROM Employees LEFT JOIN Managers ON Employees.Manager_ID = Managers.Manager_ID JOIN Roles ON Employees.Role_ID = Roles.Role_ID JOIN Departments ON Departments.Department_ID = Roles.Department_ID`,
    (err, res) => {
      err ? console.error(err) : console.table(res);
      return init();
    }
  );
};

const viewByDepartment = () => {
  // Also needs a join, just testing function calls and DB queries for now
  connection.query(`SELECT Department_Name FROM Departments`, 
  (err, res) => {
    if (err) {
        console.error(err);
    }
    for (let i = 0; i < res.length; i++) {
        if (existingDepartments.includes(`${res[i].Department_Name}`)
        ) {
            continue;
        } else {
            existingDepartments.push(`${res[i].Department_Name}`);
        }
    }
    selectViewByDepartment();
    
  });
};

const selectViewByDepartment = () => {
    inquirer.prompt(viewDeptPrompt).then((viewDeptPrompt) => {
        console.log(viewDeptPrompt.chooseDept);
        connection.query(`SELECT Employees.Employee_ID, Employees.First_Name, Employees.Last_Name, Managers.First_Name AS Manager_First_Name, Managers.Last_Name AS Manager_Last_Name, Roles.Title AS Role, Departments.Department_Name AS Department FROM Employees LEFT JOIN Managers ON Employees.Manager_ID = Managers.Manager_ID JOIN Roles ON Employees.Role_ID = Roles.Role_ID JOIN Departments ON Departments.Department_ID = Roles.Department_ID AND Department_Name = "${viewDeptPrompt.chooseDept}"`,
        (err, res) => {
            err ? console.error(err) : console.table(res);
            return init();
        }
        )
    })

};

const viewByManager = () => {
    // Also needs a join, just testing function calls and DB queries for now
    connection.query(`SELECT First_Name, Last_Name FROM Managers`, 
    (err, res) => {
      if (err) {
          console.error(err);
      }
      for (let i = 0; i < res.length; i++) {
        if (existingManagers.includes(res[i].First_Name && res[i].Last_Name)) {
          continue;
        } else {
          existingManagers.push(res[i].First_Name + " " + res[i].Last_Name);
          }
      }
      console.log(existingManagers)
      selectViewByManager();
      
    });
  };

const selectViewByManager = () => {
  //prompt is returning managers name as well, need to find way to exclude
    inquirer.prompt(viewManagerPrompt).then((viewManagerPrompt) => {
        console.log(viewManagerPrompt.chooseManager);
        let managerLast = viewManagerPrompt.chooseManager.split(' ');
        console.log(managerLast);
        connection.query(`SELECT Employees.Employee_ID, Employees.First_Name, Employees.Last_Name, Managers.First_Name AS Manager_First_Name, Managers.Last_Name AS Manager_Last_Name, Roles.Title AS Role, Departments.Department_Name AS Department FROM Employees LEFT JOIN Managers ON Employees.Manager_ID = Managers.Manager_ID AND Managers.Last_Name = "${managerLast[1]}" JOIN Roles ON Employees.Role_ID = Roles.Role_ID JOIN Departments ON Departments.Department_ID = Roles.Department_ID`,

// `SELECT * FROM Employees LEFT JOIN Managers ON Employees.Manager_ID = Managers.Manager_ID 

        (err, res) => {
            err ? console.error(err) : console.table(res);
            return init();
        }
        )
    })

};

const addRole = () => {
  inquirer.prompt(newRolePrompt).then((newRolePrompt) => {
    connection.query(
      `INSERT INTO Roles SET ?`,
      {
        Title: `${newRolePrompt.newRole}`,
        Salary: parseInt(`${newRolePrompt.salary}`),
        Department_ID: parseInt(`${newRolePrompt.departmentID}`),
      },
      (err, res) => {
        if (err) {
          console.error(err);
        }
      }
    );
    return init();
  });
};

const removeRole = () => {
  connection.query(`SELECT Title FROM Roles`, (err, res) => {
    if (err) {
      console.error(err);
    }
    // For Loop to Populate Existing Roles from DB
    for (let i = 0; i < res.length; i++) {
      if (existingRoles.includes(res[i].Title)) {
        continue;
      } else {
        existingRoles.push(res[i].Title);
      }
    }
    selectRemovedRole();
  });
};

const selectRemovedRole = () => {
  inquirer.prompt(removeRolePrompt).then((removeRolePrompt) => {
    connection.query(
      `DELETE FROM Roles WHERE Title = '${removeRolePrompt.removedRole}'`,
      (err, res) => {
        if (err) {
          console.error(err);
        }
      }
    );
    existingRoles.pop(removeRolePrompt.removedRole);
    return init();
  });
};

const addEmployeeName = () => {
  inquirer.prompt(addEmployeeNamePrompts).then((addEmployeeNamePrompts) => {
    addEmployeeRole(
      addEmployeeNamePrompts.firstName,
      addEmployeeNamePrompts.lastName
    );
  });
};

const addEmployeeRole = (firstName, lastName) => {
  connection.query(
    // Get Existing Roles from DB
    `SELECT Title FROM Roles`,
    (err, res) => {
      if (err) throw err;
      // For Loop to Populate Existing Roles from DB
      for (let i = 0; i < res.length; i++) {
        if (existingRoles.includes(res[i].Title)) {
          continue;
        } else {
          existingRoles.push(res[i].Title);
        }
      }
      existingRole(firstName, lastName);
    }
  );
};

const existingRole = (firstName, lastName) => {
  inquirer.prompt(existingRolePrompt).then((existingRolePrompt) => {
    confirmDepartment(firstName, lastName, existingRolePrompt.existingRole);
  });
};

const confirmDepartment = (firstName, lastName, selectedRole) => {
  connection.query(
    `SELECT Department_ID FROM Roles WHERE Title = '${selectedRole}'`,
    (err, res) => {
      if (err) throw err;
      let currentDepartment = res[0].Department_ID;
      addEmployeeManager(firstName, lastName, selectedRole, currentDepartment);
    }
  );
};

const addEmployeeManager = (firstName, lastName, role, dept) => {
  connection.query(
    // Get Existing Roles from DB
    `SELECT First_Name, Last_Name FROM Managers WHERE Department_ID = ${dept}`,
    (err, res) => {
      if (err) throw err;
      // For Loop to Populate Existing Roles from DB
      for (let i = 0; i < res.length; i++) {
        if (existingManagers.includes(res[i].First_Name && res[i].Last_Name)) {
          continue;
        } else {
          existingManagers.push(res[i].First_Name + " " + res[i].Last_Name);
          inquirer.prompt(selectManager).then((selectManagerResponse) => {
            determineRoleID(
              firstName,
              lastName,
              role,
              selectManagerResponse.selectManager
            );
          });
        }
      }
    }
  );
};

const determineRoleID = (firstName, lastName, Role, selectManagerResponse) => {
  connection.query(
    `SELECT Role_ID FROM Roles WHERE Title = '${Role}'`,
    (err, res) => {
      if (err) throw err;
      let currentRoleID = res[0].Role_ID;
      determineManagerID(
        firstName,
        lastName,
        currentRoleID,
        selectManagerResponse
      );
    }
  );
};

const determineManagerID = (
  firstName,
  lastName,
  currentRoleID,
  selectManagerResponse
) => {
  const currentManager = selectManagerResponse.split(" ");
  connection.query(
    `SELECT Manager_ID FROM Managers WHERE First_Name = '${currentManager[0]}' AND Last_Name = '${currentManager[1]}'`,
    (err, res) => {
      if (err) throw err;
      let currentManagerID = res[0].Manager_ID;
      completeEmployeeAdd(firstName, lastName, currentRoleID, currentManagerID);
    }
  );
};

const completeEmployeeAdd = (
  firstName,
  lastName,
  currentRoleID,
  currentManagerID
) => {
  console.log(firstName, lastName, currentRoleID, currentManagerID);
  connection.query(
    `INSERT INTO Employees(First_Name, Last_Name, Role_ID, Manager_ID) VALUES ('${firstName}', '${lastName}', ${currentRoleID}, ${currentManagerID})`,
    (err, res) => {
      if (err) throw err;
      console.log(`${res.affectedRows} item inserted!\n`);
      return init();
    }
  );
};

const removeEmployee = () => {
  connection.query(
    `SELECT First_Name, Last_Name FROM Employees`,
    (err, res) => {
      if (err) {
        console.error(err);
      }
      for (let i = 0; i < res.length; i++) {
        if (
          existingEmployees.includes(`${res[i].First_Name} ${res[i].Last_Name}`)
        ) {
          continue;
        } else {
          existingEmployees.push(`${res[i].First_Name} ${res[i].Last_Name}`);
        }
      }
      selectRemovedEmployee();
    }
  );
};

const selectRemovedEmployee = () => {
  inquirer.prompt(removedEmployeePrompt).then((removedEmployeePrompt) => {
    console.log(
      "This is the removed employee" + removedEmployeePrompt.removedEmployee
    );
    const firstLast = removedEmployeePrompt.removedEmployee.split(" ");
    console.log(firstLast);
    connection.query(
      `DELETE FROM Employees WHERE First_Name = '${firstLast[0]}' AND Last_Name = '${firstLast[1]}'`,
      (err, res) => {
        if (err) throw err;
        console.log(`${res.affectedRows} Employee Deleted!!\n`);
      }
    );
    existingEmployees.pop(removedEmployeePrompt.removedEmployee);
    return init();
  });
};

const createDepartment = () => {
  inquirer.prompt(addDepartmentPrompt).then((addDepartmentPrompt) => {
    connection.query(
      `INSERT INTO Departments SET Department_Name = '${addDepartmentPrompt.addDepartment}'`,
      (err, res) => {
        if (err) {
          console.error(err);
        }
      }
    );
    return init();
  });
};

const removeDepartment = () => {
  connection.query(`SELECT Department_Name FROM Departments`, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      console.log(res);
    }
    for (let i = 0; i < res.length; i++) {
      if (existingDepartments.includes(res[i].Department_Name)) {
        continue;
      } else {
        existingDepartments.push(res[i].Department_Name);
      }
    }
    selectRemovedDepartment();
  });
};

const selectRemovedDepartment = () => {
  inquirer.prompt(removeDepartmentPrompt).then((removeDepartmentPrompt) => {
    connection.query(
      `DELETE FROM Departments WHERE Department_Name = '${removeDepartmentPrompt.removedDepartment}'`,
      (err, res) => {
        if (err) {
          console.error(err);
        }
      }
    );
    existingDepartments.pop(removeDepartmentPrompt.removedDepartment);
    return init();
  });
};

const updateEmployeeRole = () => {
  connection.query(`SELECT First_Name, Last_Name FROM Employees`, 
    (err, res) => {
      if (err) {
          console.error(err);
      }
      for (let i = 0; i < res.length; i++) {
        if (existingEmployees.includes(res[i].First_Name && res[i].Last_Name)) {
          continue;
        } else {
          existingEmployees.push(res[i].First_Name + " " + res[i].Last_Name);
          }
      }
      console.log(existingEmployees)
      updateRole();
      
    });

}

const updateRole = () => {

} 