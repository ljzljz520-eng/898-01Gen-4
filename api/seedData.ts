import bcrypt from 'bcryptjs';
import { run, get } from './db/index';

export async function seedDatabase() {
  const existingUser = await get('SELECT id FROM users LIMIT 1');
  if (existingUser) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database with sample data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const userId0 = await run(
    'INSERT INTO users (username, email, password_hash, is_verified) VALUES (?, ?, ?, ?)',
    ['dev_user', 'dev@example.com', passwordHash, 1]
  );

  const userId1 = await run(
    'INSERT INTO users (username, email, password_hash, is_verified) VALUES (?, ?, ?, ?)',
    ['hardware_guru', 'guru@example.com', passwordHash, 1]
  );

  const userId2 = await run(
    'INSERT INTO users (username, email, password_hash, is_verified) VALUES (?, ?, ?, ?)',
    ['circuit_master', 'master@example.com', passwordHash, 0]
  );

  const userId3 = await run(
    'INSERT INTO users (username, email, password_hash, is_verified) VALUES (?, ?, ?, ?)',
    ['sensor_expert', 'expert@example.com', passwordHash, 1]
  );

  const question1 = await run(
    `INSERT INTO questions (user_id, title, description, hardware_type, firmware_version, tags, status, answer_count, view_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId1,
      'ESP32 开发板无法通过 USB 下载程序',
      '我使用的是 ESP32-WROOM-32 开发板，之前一直可以正常下载程序，但今天突然无法连接。USB 转串口芯片是 CP2102，设备管理器里可以看到 COM 口，但下载时总是显示 "Connecting........_____....._____....._____" 然后超时失败。\n\n已尝试的方法：\n1. 更换 USB 线\n2. 重启电脑和开发板\n3. 按住 BOOT 键再下载\n4. 降低波特率到 115200\n\n问题依然存在，请问可能是什么原因？',
      'circuit',
      'v4.4.1',
      JSON.stringify(['ESP32', 'USB', '下载', 'CP2102']),
      'open',
      2,
      156
    ]
  );

  const question2 = await run(
    `INSERT INTO questions (user_id, title, description, hardware_type, firmware_version, tags, status, answer_count, view_count, accepted_answer_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId2,
      'DHT22 温湿度传感器读数波动很大',
      '我在做一个温湿度监测项目，使用 DHT22 传感器连接到 Arduino Uno。但是读数波动非常大，温度有时会从 25 度跳到 35 度，湿度也不稳定。\n\n接线方式：\n- VCC -> 5V\n- GND -> GND\n- DATA -> D2 (4.7k 上拉电阻)\n\n已经加了 100uF 电解电容在 VCC 和 GND 之间，但问题没有解决。固件使用的是 Adafruit DHT 库 v1.4.3。',
      'sensor',
      'v1.4.3',
      JSON.stringify(['DHT22', 'Arduino', '传感器', '温湿度']),
      'solved',
      3,
      234,
      2
    ]
  );

  const question3 = await run(
    `INSERT INTO questions (user_id, title, description, hardware_type, firmware_version, tags, status, answer_count, view_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId3,
      '3D 打印外壳卡扣容易断裂',
      '我设计了一个传感器外壳，使用 PLA 材料打印。卡扣结构设计得比较薄（1.2mm），安装时很容易断裂。请问如何优化卡扣设计？\n\n已经考虑的方案：\n1. 增加厚度到 1.5mm\n2. 增加圆角\n3. 改用 PETG 材料\n\n还有其他更好的设计建议吗？',
      'case',
      '',
      JSON.stringify(['3D打印', '外壳', '卡扣', 'PLA']),
      'open',
      1,
      89
    ]
  );

  const answer1 = await run(
    `INSERT INTO answers (question_id, user_id, content, is_verified, verified_by, vote_count)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      question1,
      userId2,
      '这种情况我遇到过几次，可能的原因有以下几种：\n\n**1. 下载模式电路问题**\nESP32 进入下载模式需要 GPIO0 拉低，同时 EN 引脚复位。检查开发板上的自动下载电路是否正常，特别是 NPN 三极管部分。\n\n**2. CP2102 驱动问题**\n虽然设备管理器能看到 COM 口，但驱动可能有问题。建议完全卸载后重新安装最新版 CP210x 驱动。\n\n**3. 串口波特率不匹配**\n在 Arduino IDE 或 idf.py 中检查 Flash Mode 设置，应该是 DIO 或 QIO，根据你的 Flash 芯片型号。\n\n**4. 硬件故障**\n用万用表测量 EN 引脚在下载时的电平变化，确认是否有复位信号。如果没有，可能是 CP2102 的 RTS/DTR 引脚没有正确连接。\n\n建议先用示波器抓一下下载过程中 GPIO0 和 EN 的波形，这是最直接的排查方法。',
      0,
      null,
      5
    ]
  );

  const answer2 = await run(
    `INSERT INTO answers (question_id, user_id, content, is_verified, verified_by, is_accepted, vote_count)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      question2,
      userId1,
      'DHT22 读数波动大是比较常见的问题，我之前也遇到过。以下是经过验证的解决方案：\n\n**1. 电源滤波**\n你已经加了 100uF 电容，但建议在传感器 VCC 引脚旁再加一个 104（0.1uF）陶瓷电容，要尽可能靠近传感器引脚。\n\n**2. 采样率不要太高**\nDHT22 最快采样间隔是 2 秒，如果读取太频繁会导致数据不稳定。建议使用 3-5 秒的间隔。\n\n**3. 软件滤波**\n采用滑动平均滤波，连续读取 5-10 次，去掉最大值和最小值后取平均：\n```cpp\nfloat temperatures[5];\nint index = 0;\n\nfloat getFilteredTemp() {\n  temperatures[index] = dht.readTemperature();\n  index = (index + 1) % 5;\n  \n  float sum = 0;\n  for (int i = 0; i < 5; i++) sum += temperatures[i];\n  return sum / 5;\n}\n```\n\n**4. 检查接线**\n4.7k 上拉电阻要接在 DATA 和 VCC 之间，而不是 DATA 和 GND。如果线长超过 1 米，建议降低到 2.2k。\n\n**5. 检查传感器本身**\n如果以上方法都不行，可能是传感器本身质量问题。DHT22 有很多仿品，建议从正规渠道购买。\n\n我使用以上方法后，数据稳定度提升了 80%，温度波动控制在 ±0.3°C 以内。',
      1,
      userId3,
      1,
      12
    ]
  );

  const answer3 = await run(
    `INSERT INTO answers (question_id, user_id, content, is_verified, verified_by, vote_count)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      question2,
      userId3,
      '补充一个点：DHT22 对电源纹波非常敏感。如果你的电源是开关电源，干扰会比较大。\n\n建议：\n1. 使用线性稳压电源（如 LM1117-3.3V）给传感器单独供电\n2. 如果必须用开关电源，LC 滤波是必须的\n3. 传感器和 MCU 之间使用光电隔离效果最好\n\n我做过对比测试，使用线性电源后，数据稳定性确实更好。',
      0,
      null,
      3
    ]
  );

  const answer4 = await run(
    `INSERT INTO answers (question_id, user_id, content, is_verified, verified_by, vote_count)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      question3,
      userId1,
      '卡扣设计是 3D 打印的常见痛点。根据我的经验，以下几点很重要：\n\n**1. 卡扣厚度**\n对于 PLA，建议最小厚度 1.5mm，PETG 可以做到 1.2mm。但也要考虑卡扣长度，长宽比不要超过 5:1。\n\n**2. 圆角设计**\n卡扣根部的圆角非常重要，R 至少要 0.5mm，最好是 1mm。应力集中是断裂的主要原因。\n\n**3. 卡扣角度**\n卡扣的导入角度建议在 30°-45° 之间，锁定面角度在 5°-10° 之间。角度太大容易折断，太小不容易扣合。\n\n**4. 材料选择**\nPLA 太脆，不适合频繁拆装的卡扣。PETG 韧性好很多，是更好的选择。如果必须用 PLA，打印时增加壁厚（4 个壳）和 100% 填充。\n\n**5. 装配导向**\n在卡扣附近增加定位柱或导向槽，减少安装时的侧向力。\n\n附上一个我常用的卡扣尺寸：厚度 1.5mm，长度 8mm，根部圆角 R1，导入角 30°，锁定角 8°。PETG 材料，使用这个尺寸的卡扣我测试过可以拆装 50 次以上不断裂。',
      1,
      userId3,
      8
    ]
  );

  await run(
    `INSERT INTO knowledge_entries (question_id, answer_id, title, summary, tags, hardware_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      question2,
      answer2,
      'DHT22 温湿度传感器读数波动解决方案',
      '从电源滤波、采样率控制、软件滤波、接线优化等多个方面解决 DHT22 读数不稳定问题，经过验证可将温度波动控制在 ±0.3°C 以内。',
      JSON.stringify(['DHT22', '传感器', '滤波', '稳定性']),
      'sensor'
    ]
  );

  await run(
    `INSERT INTO knowledge_entries (question_id, answer_id, title, summary, tags, hardware_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      question3,
      answer4,
      '3D 打印卡扣设计优化指南',
      '详细介绍 3D 打印卡扣的设计要点，包括厚度、圆角、角度、材料选择等，提供经过测试的参考尺寸。',
      JSON.stringify(['3D打印', '卡扣', '结构设计', '材料选择']),
      'case'
    ]
  );

  await run(
    `INSERT INTO attachments (question_id, filename, original_name, file_type, file_size, license)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      question1,
      'schematic_esp32.pdf',
      'ESP32_开发板原理图.pdf',
      'schematic',
      245678,
      'cc-by-sa-4.0'
    ]
  );

  await run(
    `INSERT INTO attachments (question_id, filename, original_name, file_type, file_size, license)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      question1,
      'firmware_esp32.bin',
      'firmware_v4.4.1.bin',
      'firmware',
      1024000,
      'mit'
    ]
  );

  await run(
    `INSERT INTO attachments (question_id, filename, original_name, file_type, file_size, license)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      question2,
      'photo_dht22.jpg',
      'DHT22_接线照片.jpg',
      'photo',
      892345,
      'cc-by-4.0'
    ]
  );

  await run(
    `INSERT INTO attachments (answer_id, filename, original_name, file_type, file_size, license)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      answer2,
      'schematic_filter.pdf',
      '电源滤波电路.pdf',
      'schematic',
      156789,
      'cc-by-sa-4.0'
    ]
  );

  console.log('Database seeding completed successfully!');
}
