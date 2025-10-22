import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * The Item type represents a single item in database.
 */
interface ItemEntity {
  id: number;
  done: boolean;
  value: string;
}

export default function Index() {
  const [name, setName] = useState('');
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { justifyContent: 'center', backgroundColor: '#f6f8fa' }]}>  
      <Text style={{ fontSize: 28, color: '#7B61FF', fontWeight: 'bold', textAlign: 'center', marginBottom: 32, letterSpacing: 1 }}>
        MANAGE YOUR TASK
      </Text>
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, padding: 16, marginBottom: 32, backgroundColor: '#fff', fontSize: 16 }}
      />
      <TouchableOpacity
        style={{ backgroundColor: '#00C2FF', borderRadius: 12, padding: 18, alignItems: 'center', shadowColor: '#00C2FF', shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 }}
        onPress={() => {
          if (name.trim()) {
            router.replace({ pathname: '/home', params: { name } });
          }
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }}>GET STARTED →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function Item({
  item,
  onPressItem,
}: {
  item: ItemEntity;
  onPressItem: (id: number) => void | Promise<void>;
}) {
  const { id, done, value } = item;
  return (
    <TouchableOpacity
      onPress={() => onPressItem && onPressItem(id)}
      style={[styles.item, done && styles.itemDone]}
    >
      <Text style={[styles.itemText, done && styles.itemTextDone]}>
        {value}
      </Text>
    </TouchableOpacity>
  );
}


//#region Styles

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  flexRow: {
    flexDirection: 'row',
  },
  input: {
    borderColor: '#4630eb',
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    margin: 16,
    padding: 8,
  },
  listArea: {
    backgroundColor: '#f0f0f0',
    flex: 1,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
  item: {
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    padding: 8,
  },
  itemDone: {
    backgroundColor: '#1c9963',
  },
  itemText: {
    color: '#000',
  },
  itemTextDone: {
    color: '#fff',
  },
});

//#endregion

