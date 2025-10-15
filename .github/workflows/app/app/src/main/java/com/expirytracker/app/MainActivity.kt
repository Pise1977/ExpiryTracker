package com.expirytracker.app

import android.app.DatePickerDialog
import android.content.Context
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray
import org.json.JSONObject
import java.util.*

class MainActivity : AppCompatActivity() {
    
    private lateinit var productsContainer: LinearLayout
    private val products = mutableListOf<Product>()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setupUI()
        loadProducts()
    }
    
    private fun setupUI() {
        val mainLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(50, 50, 50, 50)
        }
        
        // Titolo
        val title = TextView(this).apply {
            text = "📱 Expiry Tracker"
            textSize = 24f
            setTextColor(resources.getColor(android.R.color.black))
            gravity = android.view.Gravity.CENTER
        }
        mainLayout.addView(title)
        
        val subtitle = TextView(this).apply {
            text = "Traccia i tuoi prodotti in scadenza"
            textSize = 16f
            gravity = android.view.Gravity.CENTER
        }
        mainLayout.addView(subtitle)
        
        // Spazio
        val space = TextView(this).apply {
            text = ""
            setPadding(0, 30, 0, 0)
        }
        mainLayout.addView(space)
        
        // Container prodotti
        productsContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1f
            )
        }
        
        val scrollView = ScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1f
            )
            addView(productsContainer)
        }
        mainLayout.addView(scrollView)
        
        // Pulsante aggiungi
        val btnAddProduct = Button(this).apply {
            text = "➕ Aggiungi Prodotto"
            setOnClickListener { showAddProductDialog() }
            setBackgroundColor(resources.getColor(android.R.color.holo_green_light))
        }
        mainLayout.addView(btnAddProduct)
        
        setContentView(mainLayout)
    }
    
    private fun showAddProductDialog() {
        val dialog = android.app.AlertDialog.Builder(this)
        val dialogView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(40, 40, 40, 40)
        }
        
        val title = TextView(this).apply {
            text = "Aggiungi Nuovo Prodotto"
            textSize = 18f
            setTextColor(resources.getColor(android.R.color.black))
        }
        dialogView.addView(title)
        
        val space = TextView(this).apply {
            text = ""
            setPadding(0, 20, 0, 0)
        }
        dialogView.addView(space)
        
        // Nome prodotto
        val etName = EditText(this).apply {
            hint = "Nome prodotto (es. Latte, Pane...)"
            setPadding(0, 10, 0, 10)
        }
        dialogView.addView(etName)
        
        // Data scadenza
        val tvDate = TextView(this).apply {
            text = "Seleziona data scadenza:"
            setPadding(0, 20, 0, 10)
        }
        dialogView.addView(tvDate)
        
        var selectedDate = ""
        val btnDate = Button(this).apply {
            text = "📅 Scegli Data"
            setOnClickListener {
                showDatePicker { date ->
                    selectedDate = date
                    tvDate.text = "Scade: $date"
                }
            }
        }
        dialogView.addView(btnDate)
        
        dialog.setView(dialogView)
        dialog.setPositiveButton("💾 Salva") { _, _ ->
            val name = etName.text.toString()
            if (name.isNotEmpty() && selectedDate.isNotEmpty()) {
                val product = Product(name, selectedDate)
                products.add(product)
                saveProducts()
                refreshProductList()
                Toast.makeText(this, "✅ Prodotto salvato!", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "❌ Compila tutti i campi!", Toast.LENGTH_SHORT).show()
            }
        }
        dialog.setNegativeButton("❌ Annulla", null)
        dialog.show()
    }
    
    private fun showDatePicker(onDateSelected: (String) -> Unit) {
        val calendar = Calendar.getInstance()
        DatePickerDialog(
            this,
            { _, year, month, day ->
                val date = String.format("%02d/%02d/%d", day, month + 1, year)
                onDateSelected(date)
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        ).show()
    }
    
    private fun refreshProductList() {
        productsContainer.removeAllViews()
        
        if (products.isEmpty()) {
            val emptyText = TextView(this).apply {
                text = "Nessun prodotto ancora.\n\nTocca 'Aggiungi Prodotto' per iniziare! 🚀"
                textSize = 16f
                gravity = android.view.Gravity.CENTER
                setPadding(0, 100, 0, 0)
            }
            productsContainer.addView(emptyText)
            return
        }
        
        // Ordina per data più vicina
        products.sortBy { it.daysUntilExpiry }
        
        products.forEach { product ->
            val productView = createProductView(product)
            productsContainer.addView(productView)
        }
    }
    
    private fun createProductView(product: Product): LinearLayout {
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(30, 20, 30, 20)
            background = resources.getDrawable(android.R.drawable.dialog_holo_light_frame)
            
            val layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            layoutParams.setMargins(0, 0, 0, 15)
            this.layoutParams = layoutParams
            
            // Nome prodotto
            val nameText = TextView(context).apply {
                text = "🛒 ${product.name}"
                textSize = 18f
                setTextColor(resources.getColor(android.R.color.black))
            }
            
            // Data scadenza
            val dateText = TextView(context).apply {
                text = "📅 ${product.expiryDate}"
                textSize = 14f
            }
            
            // Stato scadenza
            val statusText = TextView(context).apply {
                text = product.getStatusText()
                textSize = 14f
                setTextColor(product.getStatusColor(context))
            }
            
            // Pulsante elimina
            val deleteBtn = Button(context).apply {
                text = "🗑️ Elimina"
                setOnClickListener {
                    products.remove(product)
                    saveProducts()
                    refreshProductList()
                    Toast.makeText(context, "🗑️ Prodotto rimosso", Toast.LENGTH_SHORT).show()
                }
            }
            
            addView(nameText)
            addView(dateText)
            addView(statusText)
            addView(deleteBtn)
        }
    }
    
    private fun saveProducts() {
        val sharedPref = getSharedPreferences("products", Context.MODE_PRIVATE)
        val jsonArray = JSONArray()
        
        products.forEach { product ->
            val jsonObject = JSONObject().apply {
                put("name", product.name)
                put("expiryDate", product.expiryDate)
            }
            jsonArray.put(jsonObject)
        }
        
        sharedPref.edit().putString("products_list", jsonArray.toString()).apply()
    }
    
    private fun loadProducts() {
        val sharedPref = getSharedPreferences("products", Context.MODE_PRIVATE)
        val productsJson = sharedPref.getString("products_list", "[]")
        
        try {
            val jsonArray = JSONArray(productsJson)
            for (i in 0 until jsonArray.length()) {
                val jsonObject = jsonArray.getJSONObject(i)
                val product = Product(
                    jsonObject.getString("name"),
                    jsonObject.getString("expiryDate")
                )
                products.add(product)
            }
        } catch (e: Exception) {
            // Se errore, lista vuota
        }
        
        refreshProductList()
    }
}

data class Product(val name: String, val expiryDate: String) {
    val daysUntilExpiry: Long
        get() = calculateDaysUntilExpiry()
    
    private fun calculateDaysUntilExpiry(): Long {
        return try {
            val parts = expiryDate.split("/")
            val day = parts[0].toInt()
            val month = parts[1].toInt()
            val year = parts[2].toInt()
            
            val expiry = Calendar.getInstance().apply {
                set(year, month - 1, day)
            }
            val today = Calendar.getInstance()
            
            val diff = expiry.timeInMillis - today.timeInMillis
            (diff / (24 * 60 * 60 * 1000)).toLong()
        } catch (e: Exception) {
            0L
        }
    }
    
    fun getStatusText(): String {
        return when {
            daysUntilExpiry < 0 -> "❌ SCADUTO da ${-daysUntilExpiry} giorni"
            daysUntilExpiry == 0L -> "⚠️ Scade OGGI!"
            daysUntilExpiry == 1L -> "⚠️ Scade DOMANI"
            daysUntilExpiry <= 7 -> "⚠️ Scade tra $daysUntilExpiry giorni"
            else -> "✅ Scade tra $daysUntilExpiry giorni"
        }
    }
    
    fun getStatusColor(context: Context): Int {
        return when {
            daysUntilExpiry < 0 -> context.resources.getColor(android.R.color.holo_red_dark)
            daysUntilExpiry <= 7 -> context.resources.getColor(android.R.color.holo_orange_dark)
            else -> context.resources.getColor(android.R.color.holo_green_dark)
        }
    }
}
