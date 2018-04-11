var mysql = require('mysql');
var inquirer = require('inquirer')

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'bamazon_db',
	port: 3307
})


function promptUser() {

	inquirer.prompt([
		{
			type: 'input',
			name: 'id',
			message: 'Please enter the ID of the product you want to purchase',
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many would you like?',
			filter: Number
		}
	]).then(function (input) {
		console.log('\n\nYou have selected: \n    Product ID = ' + input.id + '\n    quantity = ' + input.quantity)

		var item = input.id
		var quantity = input.quantity

		connection.query('SELECT * FROM products WHERE ?', { id: item }, function (e, r) {
			if (e) throw e

			if (item === 0) {
				console.log('ERROR: Invalid Product ID. Please select a valid Product ID.')
				displayInventory()

			}
			else {
				var productData = r[0]

				if (quantity <= productData.stock_quantity) {
					console.log('Congratulations, the product you requested is in stock! Placing order!')

					var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE id = ' + item

					connection.query(updateQueryStr, function (e, r) {
						if (e) throw e

						console.log('\n\n  Your order has been placed!\n  Your total is $' + productData.price * quantity)
						console.log('  Thank you for shopping with us!')
						console.log("\n---------------------------------------------------------------------\n\n")

					})
				}
				else {
					console.log('\n\nSorry, insufficient quantity! Your order was not placed.')
					console.log("\n\n---------------------------------------------------------------------\n")
				}
				displayInventory()
			}
		})
	})
}

function printSpaces(totalLength, item) {
	var length = item.toString().length
	var result = ""
	for (var i = length; i < totalLength; i++) {
		result = result + " "
	}
	return result
}


connection.connect(function (e) {
	if (e) throw e
	displayInventory()
})


function displayInventory() {

	connection.query('SELECT * FROM products', function (e, r) {
		if (e) throw e

		console.log("============================== WELCOME TO BAMAZON ============================== \n")
		console.log('\n  INVENTORY:\n')

		var strProdRow = ''
		for (var i = 0; i < r.length; i++) {
			strProdRow = ''
			strProdRow += '  Product ID: ' + r[i].id + '    '
			strProdRow += '  Product: "' + r[i].product_name + "'" + printSpaces(38, r[i].product_name) + '    '
			strProdRow += '  Department: "' + r[i].department_name + "'" + printSpaces(17, r[i].department_name) + '    '
			strProdRow += '  Price: $' + r[i].price + '    '
			strProdRow += '  Stock remaining: ' + r[i].stock_quantity + '\n'
			console.log(strProdRow)
		}

		console.log("---------------------------------------------------------------------\n")

		promptUser()
	})
}