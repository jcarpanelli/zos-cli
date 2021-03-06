'use strict'
require('../setup')

import { Logger } from 'zos-lib';
import CaptureLogs from '../helpers/captureLogs';

import add from '../../src/scripts/add.js';
import ZosPackageFile from "../../src/models/files/ZosPackageFile";

contract('add script', function() {
  const contractName = 'ImplV1';
  const contractAlias = 'Impl';
  const contractsData = [{ name: contractName, alias: contractAlias }]

  beforeEach('setup', async function() {
    this.packageFile = new ZosPackageFile('test/mocks/packages/package-empty.zos.json')
  });

  it('should add a logic contract an alias and a filename', function() {
    add({ contractsData, packageFile: this.packageFile })

    this.packageFile.contract(contractAlias).should.eq(contractName)
  });

  it('should add a logic contract for a lib', function() {
    this.packageFile.lib = true

    add({ contractsData, packageFile: this.packageFile })

    this.packageFile.contract(contractAlias).should.eq(contractName)
  });

  it('should allow to change an existing logic contract', function() {
    add({ contractsData, packageFile: this.packageFile });

    const customContractName = 'ImplV2';
    const customContractsData = [{ name: customContractName, alias: contractAlias }]
    add({ contractsData: customContractsData, packageFile: this.packageFile })

    this.packageFile.contract(contractAlias).should.eq(customContractName)
  });

  it('should handle multiple contracts', function() {
    const customContractAlias = 'Impl'
    const customContractName = 'ImplV1'
    const anotherCustomContractAlias = 'AnotherImpl'
    const anotherCustomContractName = 'AnotherImplV1'
    const customContractsData = [
      { name: customContractName, alias: customContractAlias },
      { name: anotherCustomContractName, alias: anotherCustomContractAlias },
    ]
    add({ contractsData: customContractsData, packageFile: this.packageFile });

    this.packageFile.contract(customContractAlias).should.eq(customContractName);
    this.packageFile.contract(anotherCustomContractAlias).should.eq(anotherCustomContractName);
  });

  it('should use a default alias if one is not provided', function() {
    const contractsData = [{ name: contractName }]
    add({ contractsData, packageFile: this.packageFile })

    this.packageFile.contract(contractName).should.eq(contractName)
  });

  describe('failures', function () {
    it('should fail to add a contract that does not exist', function() {
      const contractsData = [{ name: 'NonExists', alias: contractAlias }]
      expect(() => add({ contractsData, packageFile: this.packageFile })).to.throw(/not found/);
    });

    it('should fail to add an abstract contract', function() {
      const contractsData = [{ name: 'Impl', alias: contractAlias }]
      expect(() => add({ contractsData, packageFile: this.packageFile })).to.throw(/abstract/);
    });

    xit('should fail to add a contract with an invalid alias');
  });

  describe('warnings', function () {
    beforeEach('capturing log output', function () {
      this.logs = new CaptureLogs();
    });

    afterEach(function () {
      this.logs.restore();
    });

    it('should warn when adding a contract with a constructor', async function() {
      add({ contractsData: [{ name: 'WithConstructor', alias: 'WithConstructor' }], packageFile: this.packageFile });

      this.logs.errors.should.have.lengthOf(1);
      this.logs.errors[0].should.match(/constructor/i);
    });

    it('should not warn when adding a contract without a constructor', async function() {
      add({ contractsData, packageFile: this.packageFile });

      this.logs.errors.should.have.lengthOf(0);
    });
  });
});
