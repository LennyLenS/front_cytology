# Проверка соответствия API цитологии фронтенда и бэкенда

## Эндпоинты бэкенда (из swagger/openapi)

1. **GET** `/cytology/{id}` - получение цитологии
2. **GET** `/cytology/{id}/segments` - получение сегментов
3. **POST** `/cytology/segment/group/create/{cytology_img_id}` - создание группы сегментов
4. **PATCH** `/cytology/segment/update/{id}` - обновление сегмента
5. **DELETE** `/cytology/segment/update/{id}` - удаление сегмента
6. **POST** `/cytology/copy` - копирование цитологии
7. **GET** `/cytology/history/{id}` - история цитологии
8. **PATCH** `/cytology/{id}/update` - обновление цитологии

## Вызовы во фронтенде (apps/main/src/app/cytology/[id]/core/service/cytology.ts)

### ✅ Правильные вызовы:

1. **getCytologyInfo**: `${id}` → `GET /cytology/{id}` ✅
2. **getCytologySegment**: `${id}/segments` → `GET /cytology/{id}/segments` ✅
3. **getCytologyHistory**: `/history/${id}/` → `GET /cytology/history/{id}` ✅ (trailing slash не критичен)

### ⚠️ Проблемы:

1. **addSegment**: `/segment/group/create/${cytologyId}/`
   - Ожидается: `POST /cytology/segment/group/create/{cytology_img_id}`
   - Проблема: Лишний trailing slash в конце
   - Исправление: Убрать `/` в конце

2. **patchSegment**: `/segment/update/${segmentId}/`
   - Ожидается: `PATCH /cytology/segment/update/{id}`
   - Проблема: Лишний trailing slash в конце
   - Исправление: Убрать `/` в конце

3. **deleteSegment**: `/segment/update/${segmentId}/`
   - Ожидается: `DELETE /cytology/segment/update/{id}`
   - Проблема: Лишний trailing slash в конце
   - Исправление: Убрать `/` в конце

4. **addNewRevise**: `/copy/` с телом `{ pk }`
   - Ожидается: `POST /cytology/copy` с телом `{ id: UUID }` или `{ pk: UUID }`
   - Проблема:
     - Лишний trailing slash в конце
     - Формат тела: бэкенд ожидает `{ id: UUID }` или `{ pk: UUID }`, но нужно проверить точный формат
   - Исправление: Убрать `/` в конце, проверить формат тела

5. **patchCytologyInfo**: `/${data.id}/update/`
   - Ожидается: `PATCH /cytology/{id}/update`
   - Проблема: Лишний trailing slash в конце
   - Исправление: Убрать `/` в конце

## Рекомендации по исправлению

Все проблемы связаны с лишними trailing slash в конце URL. Хотя многие серверы это игнорируют, лучше убрать их для соответствия спецификации OpenAPI.

## ✅ Исправления применены

Все trailing slash были удалены из URL:
- `addSegment`: `/segment/group/create/${cytologyId}` (было `/segment/group/create/${cytologyId}/`)
- `patchSegment`: `/segment/update/${segmentId}` (было `/segment/update/${segmentId}/`)
- `deleteSegment`: `/segment/update/${segmentId}` (было `/segment/update/${segmentId}/`)
- `addNewRevise`: `/copy` (было `/copy/`)
- `patchCytologyInfo`: `/${data.id}/update` (было `/${data.id}/update/`)
- `getCytologyHistory`: `/history/${id}` (было `/history/${id}/`)

## Проверка формата тела запроса

### addNewRevise (POST /cytology/copy)
- Фронтенд отправляет: `{ pk: string }` (где string - это UUID)
- Бэкенд ожидает: `{ id?: UUID, pk?: OptUUID }`
- ✅ Соответствует: бэкенд принимает `pk` как опциональное поле и обрабатывает его корректно
- Примечание: Бэкенд сначала проверяет `req.ID`, затем `req.Pk`, поэтому оба варианта работают

## Итоговый статус

✅ **Все API вызовы исправлены и соответствуют спецификации бэкенда**

Все найденные проблемы (лишние trailing slash) были исправлены. Теперь все эндпоинты точно соответствуют OpenAPI спецификации бэкенда.
