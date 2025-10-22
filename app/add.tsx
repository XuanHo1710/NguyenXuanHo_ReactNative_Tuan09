import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Add() {
  return (
    <SQLiteProvider databaseName="db.db" onInit={migrateDbIfNeeded}>
      <AddJob />
    </SQLiteProvider>
  );
}

function AddJob() {
  const [value, setValue] = useState('');
  const db = useSQLiteContext();
  const router = useRouter();
  return (
    <SafeAreaView style={addStyles.container}>
      <View style={addStyles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={addStyles.backBtn}>
          <Text style={addStyles.backIcon}>{'←'}</Text>
        </TouchableOpacity>
        <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={addStyles.avatar} />
        <View>
          <Text style={addStyles.hiText}>Hi</Text>
          <Text style={addStyles.subText}>Have a great day ahead</Text>
        </View>
      </View>
      <Text style={addStyles.addTitle}>ADD YOUR JOB</Text>
      <TextInput
        placeholder="Input your job"
        value={value}
        onChangeText={setValue}
        style={addStyles.input}
      />
      <TouchableOpacity
        style={addStyles.finishBtn}
        onPress={async () => {
          if (value.trim()) {
            await db.runAsync('INSERT INTO items (done, value) VALUES (?, ?);', false, value);
            router.replace('/home');
          }
        }}
      >
        <Text style={addStyles.finishText}>FINISH →</Text>
      </TouchableOpacity>
      <Image source={{ uri: 'https://play-lh.googleusercontent.com/jD8waDJPN1yv4OdcB6_ILw9M4kyNPdtgBYtoTiPrYhxA1l4FLSKXXe4kAcDCjmtZmQ4=w600-h300-pc0xffffff-pd' }} style={addStyles.noteImg} />
    </SafeAreaView>
  );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentDbVersion = result?.user_version ?? 0;
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  if (currentDbVersion === 0) {
    await db.execAsync(`
PRAGMA journal_mode = 'wal';
CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY NOT NULL, done INT, value TEXT);
`);
  }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

const addStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  backBtn: {
    marginRight: 8,
  },
  backIcon: {
    fontSize: 28,
    color: '#333',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  hiText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  subText: {
    color: '#888',
    fontSize: 13,
  },
  addTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 24,
    textAlign: 'center',
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#f8fff8',
    fontSize: 16,
  },
  finishBtn: {
    backgroundColor: '#00C2FF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#00C2FF',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  finishText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  noteImg: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    marginTop: 24,
    opacity: 0.9,
  },
});
