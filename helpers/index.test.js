import { schemaHelper } from '.';

test('schemaHelper.enumDecorator', async () => {
  const decorated = await schemaHelper.enumDecorator({
    refInclude   : { name: 'refInclude' },
    refNotInclude: { name: 'refNotInclude' },
    type         :
      {
        name   : 'type',
        ref    : 'type',
        type   : 'EnumFilter',
        options: {
          filter_type: 'Sort',
          enum_data  : [{ key: 'refInclude', value: 'refValue1' }, {
            key  : 'refNotInclude',
            value: 'refValue2',
          }],
        },
        value  : 'refInclude',
      },
  });

  expect(decorated).toEqual({
    refInclude: { name: 'refInclude', isFilterField: true, options: { filter_type: 'Sort' } },
    type      :
      {
        name   : 'type',
        ref    : 'type',
        type   : 'EnumFilter',
        options: {
          filter_type: 'Sort',
          enum_data  : [{
            key: 'refInclude', value: 'refValue1',
          }, {
            key: 'refNotInclude', value: 'refValue2',
          }],
        },
        value  : 'refInclude',
      },
  });
});

test('schemaHelper.enumDecorator no type found', async () => {
  const decorated = await schemaHelper.enumDecorator({
    type: { value: 'refInclude' },
  });

  expect(decorated).toEqual({ type: { value: 'refInclude' } });
});

test('schemaHelper.enumDecorator with SortPosition', async () => {
  const decorated = await schemaHelper.enumDecorator({
    refInclude: { value: [1, 2, 3], type: 'ManyToMany' },
    type      : {
      type   : 'EnumFilter',
      value  : 'refInclude',
      options: {
        filter_type: 'Sort',
        enum_data: [{
          key: 'refInclude', value: 'refValue1',
        }],
      },
    },
    positions : { options: { type: 'SortPosition' } },
  });

  expect(decorated).toEqual({
    refInclude: {
      type: 'ManyToMany',
      isFilterField: true,
      options: {
        filter_type: 'Sort',
      },
      value: [1, 2, 3],
    },
    type      : {
      type   : 'EnumFilter',
      value  : 'refInclude',
      options: {
        filter_type: 'Sort',
        enum_data: [{
          key: 'refInclude', value: 'refValue1',
        }],
      },
    },
    positions : { options: { type: 'SortPosition' }, value: [1, 2, 3] },
  });
});
