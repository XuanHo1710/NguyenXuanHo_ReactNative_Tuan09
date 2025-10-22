import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import {
  SQLiteProvider,
  useSQLiteContext,
  type SQLiteDatabase,
} from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ItemEntity {
  id: number;
  done: boolean;
  value: string;
}

export default function Home() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  return (
    <SQLiteProvider databaseName="db.db" onInit={migrateDbIfNeeded}>
      <Main name={name as string} router={router} />
    </SQLiteProvider>
  );
}

function Main({ name, router }: { name: string; router: any }) {
  const db = useSQLiteContext();
  const [todoItems, setTodoItems] = useState<ItemEntity[]>([]);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const refetchItems = useCallback(() => {
    async function refetch() {
      await db.withExclusiveTransactionAsync(async () => {
        setTodoItems(
          await db.getAllAsync<ItemEntity>(
            'SELECT * FROM items WHERE done = ? AND value LIKE ?',
            false,
            `%${search}%`
          )
        );
      });
    }
    refetch();
  }, [db, search]);

  useEffect(() => {
    refetchItems();
  }, [search]);

  // Custom header
  const Header = (
    <View style={styles.headerCustom}>
      <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
        <Text style={styles.backIcon}>{'←'}</Text>
      </TouchableOpacity>
      <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
      <View>
        <Text style={styles.hiText}>Hi {name || 'User'}</Text>
        <Text style={styles.subText}>Have a great day ahead</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {Header}
      <TextInput
        placeholder="Search"
        value={search}
        onChangeText={setSearch}
        style={styles.searchBox}
      />
      <ScrollView style={styles.listArea}>
        {todoItems.map((item) => (
          <View key={item.id} style={styles.taskRow}>
            <View style={styles.taskLeft}>
              <View style={styles.checkCircle}><Text style={styles.checkIcon}>✓</Text></View>
              {editId === item.id ? (
                <TextInput
                  value={editValue}
                  onChangeText={setEditValue}
                  style={styles.editInput}
                  autoFocus
                  onSubmitEditing={async () => {
                    if (editValue.trim()) {
                      await db.runAsync('UPDATE items SET value = ? WHERE id = ?;', editValue, item.id);
                      setEditId(null);
                      setEditValue('');
                      refetchItems();
                    }
                  }}
                  onBlur={() => {
                    setEditId(null);
                    setEditValue('');
                  }}
                />
              ) : (
                <Text style={styles.taskText}>{item.value}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={async () => {
              await db.runAsync('DELETE FROM items WHERE id = ?;', item.id);
              refetchItems();
            }}>
              <Text style={styles.deleteIcon}>x</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editBtn} onPress={() => {
              setEditId(item.id);
              setEditValue(item.value);
            }}>
              <Text style={styles.editIcon}>✎</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  headerCustom: {
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
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
  searchBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  listArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d6f5e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkIcon: {
    color: '#1c9963',
    fontWeight: 'bold',
    fontSize: 16,
  },
  taskText: {
    fontSize: 16,
    color: '#222',
  },
  deleteBtn: {
    marginLeft: 8,
    marginRight: 2,
    padding: 4,
  },
  deleteIcon: {
    color: '#e74c3c',
    fontSize: 20,
  },
  editBtn: {
    marginLeft: 2,
    padding: 4,
  },
  editIcon: {
    color: '#b2bec3',
    fontSize: 20,
  },
  fab: {
    backgroundColor: '#00C2FF',
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    shadowColor: '#00C2FF',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#b2bec3',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginLeft: 0,
  },
});
