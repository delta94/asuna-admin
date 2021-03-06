import { ApolloProvider } from '@apollo/react-hooks';
import { AppContext, IComponentService } from '@asuna-admin/core/context';
import { gql } from 'apollo-boost';
import * as React from 'react';

export interface IRegGraphqlProps {
  kvGql: (KVOpts: { collection: string; key: string }) => any;
}

export class ComponentService implements IComponentService {
  #components: { [key: string]: React.FC<any> } = {};

  reg(componentName: string, component: React.FC): void {
    this.#components[componentName] = component;
  }

  regGraphql(componentName: string, renderComponent: React.FC): void {
    this.#components[componentName] = (props) => (
      <ApolloProvider client={AppContext.ctx.graphql.serverClient as any /* TODO error occurred */}>
        {renderComponent({
          ...props,
          kvGql: (KVOpts: { collection: string; key: string }) => gql`
            {
              kv(collection: "${KVOpts.collection}", key: "${KVOpts.key}") {
                updatedAt
                name
                type
                value
              }
            }
          `,
        })}
      </ApolloProvider>
    );
  }

  load(componentName: string): React.FC<any> {
    return this.#components[componentName];
  }
}
