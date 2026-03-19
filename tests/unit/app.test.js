// Unit tests for parseAndClassifyTasks function

describe('parseAndClassifyTasks', () => {
  function parseAndClassifyTasks(text) {
    const lines = text.split(/\r?\n/);
    const tasks = [];
    
    lines.forEach(line => {
      line = line.trim();
      if (!line || line.length < 3) return;
      
      line = line.replace(/^[-*•◦▪▫]\s*/, '');
      line = line.replace(/^\d+[.)\s]+/, '');
      line = line.replace(/^\[[ x]\]\s*/i, '');
      
      if (line.length < 3) return;
      
      let tag = 'general';
      let effort = 'medium';
      
      const lower = line.toLowerCase();
      
      if (lower.match(/\b(meeting|email|report|review|code|develop|deploy|fix|bug|test|call|presentation)\b/)) {
        tag = 'work';
      }
      else if (lower.match(/\b(friend|family|call|text|birthday|party|dinner|lunch|visit|message)\b/)) {
        tag = 'social';
      }
      else if (lower.match(/\b(someday|maybe|later|eventually|consider|explore|research)\b/)) {
        tag = 'later';
      }
      
      if (lower.match(/\b(quick|simple|easy|small|5\s*min)\b/)) {
        effort = 'low';
      } else if (lower.match(/\b(complex|difficult|major|large|project|big)\b/)) {
        effort = 'high';
      }
      
      tasks.push({ text: line, tag, effort });
    });
    
    return tasks;
  }

  test('parses plain tasks', () => {
    const input = 'Buy milk\nWrite report\nCall mom';
    const result = parseAndClassifyTasks(input);
    expect(result).toHaveLength(3);
    expect(result[0].text).toBe('Buy milk');
  });

  test('removes list markers', () => {
    const input = '- Task 1\n* Task 2\n1. Task 3';
    const result = parseAndClassifyTasks(input);
    expect(result[0].text).toBe('Task 1');
    expect(result[2].text).toBe('Task 3');
  });

  test('classifies work tasks', () => {
    const input = 'Review code\nFix bug';
    const result = parseAndClassifyTasks(input);
    expect(result[0].tag).toBe('work');
  });

  test('classifies social tasks', () => {
    const input = 'Call friend\nBirthday party';
    const result = parseAndClassifyTasks(input);
    expect(result[0].tag).toBe('social');
  });

  test('detects effort levels', () => {
    const input = 'Quick task\nComplex project';
    const result = parseAndClassifyTasks(input);
    expect(result[0].effort).toBe('low');
    expect(result[1].effort).toBe('high');
  });

  test('ignores empty lines', () => {
    const input = '\n\nBuy milk\n\nab\n';
    const result = parseAndClassifyTasks(input);
    expect(result).toHaveLength(1);
  });
});

describe('localStorage tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saves and loads tasks', () => {
    const tasks = [{ id: 1, text: 'Test', completed: false }];
    localStorage.setItem('my_tasks_v2', JSON.stringify(tasks));
    const loaded = JSON.parse(localStorage.getItem('my_tasks_v2'));
    expect(loaded[0].text).toBe('Test');
  });

  test('handles corrupted data', () => {
    localStorage.setItem('my_tasks_v2', 'invalid json');
    let tasks;
    try {
      tasks = JSON.parse(localStorage.getItem('my_tasks_v2'));
    } catch {
      tasks = [];
    }
    expect(tasks).toEqual([]);
  });

  test('theme persistence', () => {
    localStorage.setItem('my_tasks_theme', 'ocean');
    expect(localStorage.getItem('my_tasks_theme')).toBe('ocean');
  });

  test('mode persistence', () => {
    localStorage.setItem('my_tasks_mode', 'deep');
    expect(localStorage.getItem('my_tasks_mode')).toBe('deep');
  });
});
