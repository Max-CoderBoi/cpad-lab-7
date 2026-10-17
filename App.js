import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Salary', 'Other'];

// Alert.alert does not show on web, so fall back to window.alert there
const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

/* ---------- Widget 1: SummaryCard ---------- */
function SummaryCard({ balance, income, expense }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>Total Balance</Text>
      <Text style={styles.balance}>₹ {balance.toFixed(2)}</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summarySmallLabel}>Income</Text>
          <Text style={[styles.summaryAmount, { color: '#a5d6a7' }]}>
            ₹ {income.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summarySmallLabel}>Expense</Text>
          <Text style={[styles.summaryAmount, { color: '#ef9a9a' }]}>
            ₹ {expense.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ---------- Widget 2: CategoryChip ---------- */
function CategoryChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------- Widget 3: AddForm ---------- */
function AddForm({ onAdd }) {
  // local state for the input fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'income' | 'expense'
  const [category, setCategory] = useState('Food');

  const handleSubmit = () => {
    const value = parseFloat(amount);

    // validation
    if (title.trim() === '' || isNaN(value) || value <= 0) {
      showAlert('Invalid input', 'Enter a title and an amount greater than 0.');
      return;
    }

    onAdd({
      id: Date.now().toString(), // unique id
      title: title.trim(),
      amount: value,
      type,
      category,
    });

    // reset fields
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('Food');
  };

  return (
    <View style={styles.form}>
      <Text style={styles.formHeading}>Add Transaction</Text>

      {/* Income / Expense toggle */}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeBtn,
            type === 'income' && { backgroundColor: '#2e7d32' },
          ]}
          onPress={() => setType('income')}
        >
          <Text style={[styles.typeText, type === 'income' && { color: '#fff' }]}>
            Income
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeBtn,
            type === 'expense' && { backgroundColor: '#c62828' },
          ]}
          onPress={() => setType('expense')}
        >
          <Text style={[styles.typeText, type === 'expense' && { color: '#fff' }]}>
            Expense
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Title (e.g. Lunch)"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c}
            label={c}
            selected={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={handleSubmit}>
        <Text style={styles.addBtnText}>Add Transaction</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- Widget 4: TransactionItem ---------- */
function TransactionItem({ item, onDelete }) {
  const isIncome = item.type === 'income';
  return (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
      <Text
        style={[styles.itemAmount, { color: isIncome ? '#2e7d32' : '#c62828' }]}
      >
        {isIncome ? '+' : '-'} ₹ {item.amount.toFixed(2)}
      </Text>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- Root widget: App ---------- */
export default function App() {
  const [transactions, setTransactions] = useState([]);

  const addTransaction = (t) => setTransactions((prev) => [t, ...prev]);

  const deleteTransaction = (id) =>
    setTransactions((prev) => prev.filter((t) => t.id !== id));

  // totals are recalculated on every render
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem item={item} onDelete={deleteTransaction} />
        )}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.appTitle}>Expense Manager</Text>
            <SummaryCard balance={balance} income={income} expense={expense} />
            <AddForm onAdd={addTransaction} />
            <Text style={styles.listHeading}>Transactions</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No transactions yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a237e',
    marginBottom: 14,
  },

  // SummaryCard
  summaryCard: {
    backgroundColor: '#283593',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },
  summaryLabel: { color: '#c5cae9', fontSize: 14, textAlign: 'center' },
  balance: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  summaryBox: { alignItems: 'center' },
  summarySmallLabel: { color: '#c5cae9', fontSize: 13 },
  summaryAmount: { fontSize: 18, fontWeight: '600' },

  // AddForm
  form: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  formHeading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  typeRow: { flexDirection: 'row', marginBottom: 10 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  typeText: { fontWeight: '600', color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fafafa',
    color: '#000',
  },
  label: { fontWeight: '600', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },

  // CategoryChip
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#e8eaf6',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: '#3949ab' },
  chipText: { color: '#3949ab', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },

  addBtn: {
    backgroundColor: '#3949ab',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // List + TransactionItem
  listHeading: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
  },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemCategory: { fontSize: 12, color: '#777', marginTop: 2 },
  itemAmount: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 10 },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffebee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: { color: '#c62828', fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#888', marginTop: 20, fontSize: 15 },
});