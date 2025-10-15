package com.working.expirytracker

import android.app.DatePickerDialog
import android.content.Context
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import java.util.*

class MainActivity : AppCompatActivity() {
    
    private lateinit var container: LinearLayout
    private val products = mutableListOf<String>()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createSimpleUI()
    }
    
    private fun createSimpleUI() {
        // Layout principale
        val mainLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(50, 50, 50, 50)
        }
        
        // Titolo
        val title = TextView(this).apply {
            text = "🎯 Expiry Tracker"
            textSize = 24f
            gravity = android.view.Gravity.CENTER
        }
        mainLayout.addView(title)
        
        val subtitle = TextView(this).apply {
            text = "App per tracciare scadenze"
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
        
        // Container per prodotti
        container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
        }
        
        val scrollView = ScrollView(this).apply {
            addView(container)
        }
        mainLayout.addView(scrollView)
        
        // Pulsante aggiungi
        val addButton = Button(this).apply {
            text = "➕ AGGIUNGI PRODOTTO"
            setOnClickListener { showAddDialog() }
        }
        mainLayout.addView(addButton)
        
        setContentView(mainLayout)
        
        // Messaggio iniziale
        showMessage("App caricata! Clicca per aggiungere prodotti.")
    }
    
    private fun showAddDialog() {
        val dialogView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(40, 40, 40, 40)
        }
        
        // Input nome
        val nameInput = EditText(this).apply {
            hint = "Nome prodotto..."
        }
        dialogView.addView(nameInput)
        
        var selectedDate = ""
        val dateText = TextView(this).apply {
            text = "Data: non impostata"
        }
        dialogView.addView(dateText)
        
        // Pulsante data
        val dateButton = Button(this).apply {
            text = "📅 SELEZIONA DATA"
            setOnClickListener {
                showDatePicker { date ->
                    selectedDate = date
                    dateText.text = "Data: $date"
                }
            }
        }
        dialogView.addView(dateButton)
        
        AlertDialog.Builder(this)
            .setTitle("Aggiungi Prodotto")
            .setView(dialogView)
            .setPositiveButton("SALVA") { dialog, which ->
                val name = nameInput.text.toString()
                if (name.isNotEmpty() && selectedDate.isNotEmpty()) {
                    products.add("$name - Scade: $selectedDate")
                    refreshList()
                    showMessage("Prodotto salvato: $name")
                }
            }
            .setNegativeButton("ANNULLA", null)
            .show()
    }
    
    private fun showDatePicker(onDateSelected: (String) -> Unit) {
        val calendar = Calendar.getInstance()
        DatePickerDialog(
            this,
            { _, year, month, day ->
                val date = "$day/${month + 1}/$year"
                onDateSelected(date)
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        ).show()
    }
    
    private fun refreshList() {
        container.removeAllViews()
        
        if (products.isEmpty()) {
            val emptyText = TextView(this).apply {
                text = "Nessun prodotto. Clicca il pulsante per aggiungerne!"
                gravity = android.view.Gravity.CENTER
                setPadding(0, 50, 0, 0)
            }
            container.addView(emptyText)
            return
        }
        
        products.forEach { product ->
            val productView = TextView(this).apply {
                text = "📦 $product"
                textSize = 16f
                setPadding(20, 10, 20, 10)
                setBackgroundResource(android.R.drawable.dialog_holo_light_frame)
            }
            container.addView(productView)
        }
    }
    
    private fun showMessage(text: String) {
        Toast.makeText(this, text, Toast.LENGTH_SHORT).show()
    }
}
